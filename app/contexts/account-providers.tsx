"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { toArrayCoords, useGeolocation } from "./geolocation-provider";
import { SERVER_URL, socket, socketfetch } from "@/lib/server";
import { createHash } from "crypto";
import { EMOTICONS, randomEmoticonIndex } from "@/lib/emoticon";

const PresenceContext = createContext<[boolean, (nextPresence: boolean) => void] | null>(null);
const SelfIdContext = createContext<[string, string] | null>(null);
const UsernameContext = createContext<
    [string | null, (nextUsername: string) => Promise<void>] | null
>(null);
const AvatarContext = createContext<
    [string | null, number, (nextAvatar: number) => Promise<void>] | null
>(null);

type SignUp = (username: string, password: string, fromGuest: boolean) => Promise<void>
type SignIn = (username: string, password: string) => Promise<void>
type SignOut = (deleteAccount?: boolean) => Promise<void>
const AccountControlsContext = createContext<[SignUp, SignIn, SignOut] | null>(null);

export function usePresence() { return useContext(PresenceContext)!; }
export function useJWT() { 
    const selfId = useContext(SelfIdContext);
    return selfId? selfId[0] : undefined; 
}
export function useUid() { 
    const selfId = useContext(SelfIdContext);
    return selfId? selfId[1] : undefined; 
}
export function useUsername() { return useContext(UsernameContext)!; }
export function useAvatar() { return useContext(AvatarContext)!; }

export function useAccountControls() { return useContext(AccountControlsContext)!; }

function parseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

type Props = {
    children: React.ReactNode;
};
export default function AccountContextProvider({ children }: Props) {
    const [presence, setPresenceState] = useState(true);
    
    async function setPresence(visible: boolean) {
        if (presence == visible) return;
        
        if (visible) {
            localStorage.removeItem("invisible");
            await enterWorld();
        } 
        else {
            localStorage.setItem("invisible", "");
            await exitWorld(false);
        }
        setPresenceState(visible);
    }
    

    const [selfId, setSelfId] = useState<[string, string] | null>(null);
    const jwt = selfId? selfId[0] : undefined;
    function setJWT(jwt: string) {
        setSelfId([jwt, parseJwt(jwt).uid]);
    }
    
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<number>(0);
    
    async function changeUsername(username: string) {
        if (!jwt) return;
        await socketfetch("edit-user", {jwt, username } );
        setUsername(username);
    }
    async function changeAvatar(avatar: number) {
        if (!jwt) return;
        await socketfetch("edit-user", {jwt, avatar } );
        setAvatar(avatar);
    }

    const [geolocation, onceGeolocationReady] = useGeolocation();

    function clearAccountInfo() {
        setSelfId(null);
        setUsername(null);
        localStorage.removeItem("jwt");
        sessionStorage.clear();
    }
    
    /** if `newAvatar` is not given, sign up using guest jwt */
    async function signUp(username: string, password: string, fromGuest: boolean) {
        password = hash(password);
        
        if (fromGuest && presence && jwt) {
            await socketfetch("sign-up-from-guest", {guest_jwt: jwt, username, password });
            localStorage.setItem("jwt", jwt);
        }
        else {
            const nextJWT = await socketfetch<string>("sign-up", {username, password, avatar, pos: presence? geolocation : undefined});
            setJWT(nextJWT);
            localStorage.setItem("jwt", nextJWT);
        }
        setUsername(username);
    }
    async function signIn(newUsername: string, password: string) {
        if (username != null) throw new Error(`already signed in as ${username}!`);
        
        const { jwt: nextJWT, avatar } = await socketfetch<{jwt: string, avatar: number}>("sign-in", {
            username: newUsername,
            password: hash(password),
            pos: (geolocation && presence)? toArrayCoords(geolocation) : undefined,
            guest_jwt: presence? jwt : undefined
        });

        setJWT(nextJWT);
        localStorage.setItem("jwt", nextJWT);
        setUsername(newUsername);
        setAvatar(avatar);
    }
    
    function enterWorldAsGuest(avatar: number) {
        onceGeolocationReady(coords => {
            socketfetch<string>("enter-world-as-guest", { 
                pos: toArrayCoords(coords), 
                avatar
            })
            .then(nextJWT => setJWT(nextJWT));
        });
    }
    
    async function enterWorld() {
        if (!geolocation) return;
        if (username) {
            await socketfetch("enter-world", { jwt, pos: toArrayCoords(geolocation) });
        }
        else    enterWorldAsGuest(avatar);
    }
    async function exitWorld(stayOnline: boolean = presence, deleteAccount?: boolean) {
        if (!jwt) return;

        let guest_jwt = await socketfetch<string | null>("exit-world", { jwt, stay_online: stayOnline, delete_account: deleteAccount});
        
        // stayed online as guest
        if (guest_jwt) {
            setUsername(null);
            setJWT(guest_jwt);
            localStorage.removeItem("jwt");
        }
    }
    async function signOut(deleteAccount?: boolean) {
        if (presence || deleteAccount) await exitWorld(presence, deleteAccount);
        if (!presence) clearAccountInfo();
    }
    
    // send move event with jwt 
    useEffect(() => {
        const watchId = navigator.geolocation?.watchPosition(
            ({coords}) => {
                socketfetch("move", {jwt, pos: [coords.longitude, coords.latitude]});
            },
            () => {},
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation?.clearWatch(watchId);
    }, [jwt]);
    
    
    
    function signInAsGuest(enterWorld: boolean) {
        clearAccountInfo();
        
        const avatar = randomEmoticonIndex();
        setAvatar(avatar);
        if (enterWorld) enterWorldAsGuest(avatar);
    }
    
    // initialize jwt, avatar, username, presence based on localStorage data
    useEffect(() => {
        
        const savedJWT = localStorage.getItem("jwt");
        
        const savedPresence = localStorage.getItem("invisible") == null;
        setPresenceState(savedPresence);
        
        if (savedJWT == null) signInAsGuest(savedPresence);
        else {
            
            type SignInFromJWTResp = {username: string, avatar: number};
            
            function initAccInfo({username, avatar}: SignInFromJWTResp) {
                setJWT(savedJWT!);
                setUsername(username);
                setAvatar(avatar);
            }
            function fallbackAsGuest(e: any) {
                console.error("err signing in as user, signing as guest instead");
                console.error(e);
                signInAsGuest(savedPresence);
            }
            
             
            if (savedPresence) {
                onceGeolocationReady(async pos => {
                    await socketfetch<SignInFromJWTResp>("sign-in-from-jwt", {jwt: savedJWT, pos: toArrayCoords(pos)})
                    .then(initAccInfo)
                    .catch(fallbackAsGuest)
                });
            }
            else {
                socketfetch<SignInFromJWTResp>("sign-in-from-jwt", {jwt: savedJWT})
                .then(initAccInfo)
                .catch(fallbackAsGuest)
            }
        }
    }, []);
    
    // exit world and save geolocation before closing
    useEffect(() => {
        const onExit = () => {
            exitWorld(false);
            localStorage.setItem("geolocation", JSON.stringify(geolocation));
        };
        window.addEventListener("beforeunload", onExit);
        return () => window.removeEventListener("beforeunload", onExit);
    }, [geolocation]);
    
    return (
        <PresenceContext.Provider value={[presence, setPresence]}>
            <SelfIdContext.Provider value={selfId}>
                <UsernameContext.Provider value={[username, changeUsername]}>
                    <AvatarContext.Provider value={[EMOTICONS[avatar], avatar, changeAvatar]}>
                        <AccountControlsContext.Provider value={[signUp, signIn, signOut]}>
                            {children}
                        </AccountControlsContext.Provider>
                    </AvatarContext.Provider>
                </UsernameContext.Provider>
            </SelfIdContext.Provider>
        </PresenceContext.Provider>
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
