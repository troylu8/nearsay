"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { toArrayCoords, useGeolocation } from "./geolocation-provider";
import { socketfetch } from "@/lib/server";
import { createHash } from "crypto";
import { EMOTICONS } from "@/lib/emoticon";
import { useSettings } from "./settings-provider";

const JWTContext = createContext<string | null>(null);
const UsernameContext = createContext<
    [string | null, (nextUsername: string) => Promise<void>] | null
>(null);
const AvatarContext = createContext<
    [string | null, (nextAvatar: number) => Promise<void>] | null
>(null);

type SignUp = (username: string, password: string, avatar?: number) => Promise<void>
type SignIn = (username: string, password: string) => Promise<void>
type EnterWorld = () => Promise<void>
type ExitWorld = (stayOnline?: boolean, deleteAccount?: boolean) => Promise<void>
const AccountControlsContext = createContext<[SignUp, SignIn, EnterWorld, ExitWorld] | null>(null);

export function useJwt() { return useContext(JWTContext); }
export function useUsername() { return useContext(UsernameContext)!; }
export function useAvatar() { return useContext(AvatarContext)!; }

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
    const settings = useSettings()[0];

    const [jwt, setJWT] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<number>(0);
    
    const saveJWT = bindToLocalStorage("jwt", setJWT);
    const saveUsername = bindToLocalStorage("username", setUsername);
    const saveAvatar = bindToLocalStorage("avatar", setAvatar);

    async function changeUsername(username: string) {
        await socketfetch("edit-user", {jwt, update: { username } } );
        saveUsername(username);
    }
    async function changeAvatar(avatar: number) {
        await socketfetch("edit-user", {jwt, update: { avatar } } );
        saveAvatar(avatar);
    }

    const geolocation = useGeolocation();

    function clearAccountInfo() {
        console.log("clearing acc data");
        setJWT(null);
        setUsername(null);
        localStorage.removeItem("jwt");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");
        sessionStorage.clear();
    }
    
    async function signUpAsGuest() {
        if (geolocation.err) throw geolocation.err;
        clearAccountInfo();
        
        let randomAvatar = Math.floor(Math.random() * 10);
        
        let nextJWT = await socketfetch<string>("sign-up-as-guest", { 
            pos: toArrayCoords(geolocation.userPos!), 
            avatar: randomAvatar
        });
        saveJWT(nextJWT);
        saveAvatar(randomAvatar);
    }
    
    /** if `newAvatar` is not given, sign up using guest jwt */
    async function signUp(username: string, password: string, avatar?: number) {
        if (geolocation.err) throw geolocation.err;
        
        password = hash(password);
        
        if (avatar == undefined) await socketfetch("sign-up-from-guest", {guest_jwt: jwt, username, password })
        else {
            const nextJWT = await socketfetch<string>("sign-up", {username, password, avatar, pos: toArrayCoords(geolocation.userPos!)});
            saveJWT(nextJWT);
            saveAvatar(avatar);
        }
        saveUsername(username);
    }
    async function signIn(username: string, password: string) {
        if (geolocation.err) throw geolocation.err;
        
        if (jwt != null) exitWorld(false);

        const { jwt: nextJWT, avatar } = await socketfetch<{jwt: string, avatar: number}>("sign-in", {
            username,
            password: hash(password),
            pos: toArrayCoords(geolocation.userPos!)
        });

        saveJWT(nextJWT);
        saveUsername(username);
        saveAvatar(avatar);
    }
    async function enterWorld() {
        if (geolocation.err) throw geolocation.err;
        if (!jwt) return;
        await socketfetch("enter-world", { jwt, pos: toArrayCoords(geolocation.userPos!) });
    }
    async function exitWorld(stayOnline: boolean = settings.present, deleteAccount?: boolean) {
        if (!jwt) return;

        let guest_jwt = await socketfetch<string | null>("exit-world", { jwt, stay_online: stayOnline, delete_account: deleteAccount});
        if (guest_jwt) {
            saveUsername(null);
            saveJWT(guest_jwt);
        }
        else clearAccountInfo();
    }

    //TODO: settings, avatar/username change
    
    useEffect(() => {
        const accountInfo = getStoredAccountInfo();

        if (!accountInfo) signUpAsGuest();
        else if (geolocation.userPos) {
            
            console.log("signing in with existing data: ", accountInfo);
            const [jwt, username, avatar] = accountInfo;
            
            setJWT(jwt);
            setUsername(username);
            setAvatar(avatar);
            
            enterWorld();
        }
    }, []);

    // exit world upon closing tab
    useEffect(() => {
        const onTabClose = () => exitWorld();
        window.addEventListener("beforeunload", onTabClose);
        return () => window.removeEventListener("beforeunload", onTabClose);
    }, [jwt, settings.present])

    return (
        <JWTContext.Provider value={jwt}>
            <UsernameContext.Provider value={[username, changeUsername]}>
                <AvatarContext.Provider value={[EMOTICONS[avatar], changeAvatar]}>
                    <AccountControlsContext.Provider value={[signUp, signIn, enterWorld, exitWorld]}>
                        {children}
                    </AccountControlsContext.Provider>
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

function hash(text: string) {
    return createHash("sha256").update(text).digest("hex");
}
