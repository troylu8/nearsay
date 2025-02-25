"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { toArrayCoords, useGeolocation } from "./geolocation-provider";
import { emitAsync } from "@/lib/server";
import { createHash } from "crypto";
import { EMOTICONS } from "@/lib/emoticon";

type Settings = {
    presence: boolean
}

const JWTContext = createContext<string | null>(null);
const UsernameContext = createContext<
    [string | null, (nextUsername: string) => Promise<void>] | null
>(null);
const AvatarContext = createContext<
    [string | null, (nextAvatar: number) => Promise<void>] | null
>(null);
const SettingsContext = createContext<
    [Settings, (settingsUpdate: Record<string, any>) => void] | null
>(null);

type SignUp = (username: string, password: string, newAvatar?: number) => Promise<void>
type SignIn = (username: string, password: string) => Promise<void>
type SignOut = (stayOnline?: boolean) => Promise<void>
const AccountControlsContext = createContext<[SignUp, SignIn, SignOut] | null>(null);

export function useJwt() { return useContext(JWTContext); }
export function useUsername() { return useContext(UsernameContext)!; }
export function useAvatar() { return useContext(AvatarContext)!; }
export function useSettings() { return useContext(SettingsContext)!; }

export function useAccountControls() { return useContext(AccountControlsContext)!; }

function bindToLocalStorage<T>(key: string, setter: (next: T) => any) {
    return (next: T) => {

        console.log(key, next);

        setter(next);

        if (next == null)   localStorage.removeItem(key);
        else                localStorage.setItem(key, "" + next);
    }
}

type Props = {
    children: React.ReactNode;
};
export default function AccountContextProvider({ children }: Props) {
    const [jwt, setJWT] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<number>(0);
    const [settings, setSettings] = useState<Settings>({
        presence: true
    });

    async function changeUsername(username: string) {
        await emitAsync("edit-user", {jwt, update: { username } } );
        setUsername(username);
    }
    async function changeAvatar(avatar: number) {
        await emitAsync("edit-user", {jwt, update: { avatar } } );
        setAvatar(avatar);
    }
    function changeSettings(settingsUpdate: Record<string, any>) {
        setSettings(prev => ({...prev, ...settingsUpdate}) );
    }

    const geolocation = useGeolocation();

    const saveJWT = bindToLocalStorage("jwt", setJWT);
    const saveUsername = bindToLocalStorage("username", setUsername);
    const saveAvatar = bindToLocalStorage("avatar", setAvatar);

    function clearAccountInfo() {
        console.log("clearing acc data");
        setJWT(null);
        setUsername(null);
        localStorage.removeItem("jwt");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");
        sessionStorage.clear();
    }
    async function signUp(username: string, password: string, newAvatar?: number) {
        let nextJWT = await signUpRequest(jwt, username, password, newAvatar ?? avatar);
        saveJWT(nextJWT);
        saveUsername(username);
        if (newAvatar) saveAvatar(newAvatar);
    }
    async function signIn(username: string, password: string) {
        if (geolocation.err) throw geolocation.err;

        const { jwt, avatar } = await signInRequest(username, password, toArrayCoords(geolocation.userPos!));

        await signOut(false);

        saveJWT(jwt);
        saveUsername(username);
        saveAvatar(avatar);
    }
    function signInAsGuest() {
        clearAccountInfo();
        const randomAvatar = Math.floor(Math.random() * 10);
    
        if (geolocation.userPos) {
            signInAsGuestRequest(toArrayCoords(geolocation.userPos), randomAvatar)
                .then(returnedJwt => {
                    console.log("signed in as guest: ", returnedJwt);
                    saveJWT(returnedJwt)
                    saveAvatar(randomAvatar);
                })
    
                // only possible error code is 500
                .catch(() => console.log("error signing in as guest")); 
        }
        else {
            console.log("error getting geolocation");
        }
    }
    async function signOut(stayOnline: boolean = settings.presence) {
        console.log("signing out: ", jwt);
        if (!jwt) return;

        let guest_jwt = await emitAsync<string | null>("sign-out", { jwt, stay_online: stayOnline });
        if (guest_jwt) {
            saveUsername(null);
            saveJWT(guest_jwt);
        }
        else clearAccountInfo();
    }

    //TODO: settings, avatar/username change
    
    useEffect(() => {
        const accountInfo = getStoredAccountInfo();

        if (!accountInfo) signInAsGuest();
        else {
            console.log("signing in with existing data: ", accountInfo);
            const [jwt, username, avatar] = accountInfo;

            if (geolocation.userPos) {
                startSessionRequest(jwt, toArrayCoords(geolocation.userPos))
                    .then(() => {
                        setJWT(jwt);
                        setUsername(username);
                        setAvatar(avatar);
                    })
                    .catch(signInAsGuest);
            }
            else {
                console.log("error getting geolocation");
            }
        }
    }, []);

    // sign out upon closing tab
    useEffect(() => {
        const goOffline = () => signOut(false);
        
        window.addEventListener("beforeunload", goOffline);
        return () => window.removeEventListener("beforeunload", goOffline);
    }, [jwt, settings.presence])

    return (
        <JWTContext.Provider value={jwt}>
            <UsernameContext.Provider value={[username, changeUsername]}>
                <AvatarContext.Provider value={[EMOTICONS[avatar], changeAvatar]}>
                    <SettingsContext.Provider value={[settings, changeSettings]}>
                        <AccountControlsContext.Provider value={[signUp, signIn, signOut]}>
                            {children}
                        </AccountControlsContext.Provider>
                    </SettingsContext.Provider>
                </AvatarContext.Provider>
            </UsernameContext.Provider>
        </JWTContext.Provider>
    );
}



/** 
 * if all `jwt, username, avatar` are present in `localStorage`, returns `[jwt, username, avatar]`
 * 
 * otherwise, returns `null`
 */
function getStoredAccountInfo(): [string, string, number] | null {

    const jwt = localStorage.getItem("jwt");
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");

    return jwt && username && avatar ? [jwt, username, Number(avatar)] : null;
}

function signUpRequest(guestJWT: string | null, username: string, password: string, avatar: number) {
    return emitAsync<string>("sign-up", {
        guest_jwt: guestJWT ?? undefined,
        username,
        userhash: createHash("sha256").update(password).digest("hex"),
        avatar
    });
}

function signInRequest(username: string, password: string, pos: [number, number]) {
    return emitAsync<{jwt: string, avatar: number}>("sign-in", {
        username,
        userhash: createHash("sha256").update(password).digest("hex"),
        pos
    });
}

function signInAsGuestRequest(pos: [number, number], avatar: number) {
    return emitAsync<string>("sign-in-guest", { pos, avatar });
}

function startSessionRequest(jwt: string, pos: [number, number]) {
    return emitAsync<null>("start-session", {jwt, pos});
}