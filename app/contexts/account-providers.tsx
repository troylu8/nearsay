"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import { onNextGeolocation, toArrayCoords, useGeolocation } from "./geolocation-provider";
import { SERVER_URL, socket, socketfetch } from "@/lib/server";
import { createHash } from "crypto";
import { EMOTICONS } from "@/lib/emoticon";

const DesiredPresenceContext = createContext<[boolean, (nextDesiredPresence: boolean) => void] | null>(null);
const SelfIdContext = createContext<[string, string] | null>(null);
const UsernameContext = createContext<
    [string | null, (nextUsername: string) => Promise<void>] | null
>(null);
const AvatarContext = createContext<
    [string | null, number, (nextAvatar: number) => Promise<void>] | null
>(null);

type SignUp = (username: string, password: string, avatar?: number) => Promise<void>
type SignIn = (username: string, password: string) => Promise<void>
type EnterWorld = () => Promise<void>
type ExitWorld = (stayOnline?: boolean, deleteAccount?: boolean) => Promise<void>
const AccountControlsContext = createContext<[SignUp, SignIn, EnterWorld, ExitWorld] | null>(null);

export function useDesiredPresence() { return useContext(DesiredPresenceContext)!; }
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
    const [desiredPresence, setDesiredPresenceState] = useState(true);
    
    function setDesiredPresence(next: boolean) {
        setDesiredPresenceState(next);
        if (!next) {
            localStorage.setItem("invisible", "");
            exitWorld(false);
        } 
        else {
            localStorage.removeItem("invisible");
            enterWorld();
        }
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
        await socketfetch("edit-user", {jwt, update: { username } } );
        setUsername(username);
    }
    async function changeAvatar(avatar: number) {
        if (!jwt) return;
        await socketfetch("edit-user", {jwt, update: { avatar } } );
        setAvatar(avatar);
    }

    const geolocation = useGeolocation();

    function clearAccountInfo() {
        console.log("clearing acc data");
        setSelfId(null);
        setUsername(null);
        localStorage.removeItem("jwt");
        sessionStorage.clear();
    }
    
    /** if `newAvatar` is not given, sign up using guest jwt */
    async function signUp(username: string, password: string, avatar?: number) {
        password = hash(password);
        
        if (avatar == undefined) await socketfetch("sign-up-from-guest", {guest_jwt: jwt, username, password })
        else {
            const nextJWT = await socketfetch<string>("sign-up", {username, password, avatar, pos: geolocation});
            setJWT(nextJWT);
            localStorage.setItem("jwt", nextJWT);
            setAvatar(avatar);
        }
        setUsername(username);
    }
    async function signIn(newUsername: string, password: string) {
        if (username != null) throw new Error(`already signed in as {username}!`);

        const { jwt: nextJWT, avatar } = await socketfetch<{jwt: string, avatar: number}>("sign-in", {
            username: newUsername,
            password: hash(password),
            pos: geolocation,
            guest_jwt: jwt
        });

        setJWT(nextJWT);
        localStorage.setItem("jwt", nextJWT);
        setUsername(newUsername);
        setAvatar(avatar);
    }
    async function enterWorld() {
        if (!geolocation || !selfId) return;
        await socketfetch("enter-world", { jwt, pos: toArrayCoords(geolocation) });
    }
    async function exitWorld(stayOnline: boolean = desiredPresence, deleteAccount?: boolean) {
        if (!jwt) return;

        let guest_jwt = await socketfetch<string | null>("exit-world", { jwt, stay_online: stayOnline, delete_account: deleteAccount});
        if (guest_jwt) {
            setUsername(null);
            setJWT(guest_jwt);
        }
        else clearAccountInfo();
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
    
    
    // initialize jwt, avatar, username, desiredPresence based on localStorage data
    useEffect(() => {
        
        const savedJWT = localStorage.getItem("jwt");
        
        const savedDesiredPresence = localStorage.getItem("invisible") == null;
        setDesiredPresenceState(savedDesiredPresence);
        
        if (savedJWT == null) {
            
            const randomAvatar = Math.floor(Math.random() * 10);
            setAvatar(randomAvatar);
            
            if (savedDesiredPresence) {
                clearAccountInfo();
                
                onNextGeolocation(coords => {
                    socketfetch<string>("sign-up-as-guest", { 
                        pos: [coords.longitude, coords.latitude], 
                        avatar: randomAvatar
                    })
                    .then(nextJWT => setJWT(nextJWT));
                });
            };
        }
        else {
            fetch(`${SERVER_URL}/users/id/${parseJwt(savedJWT).uid}`)
            .then(res => res.json())
            .then((user: {avatar: number, username: string}) => {
                setJWT(savedJWT);
                setAvatar(user.avatar);
                setUsername(user.username);
            });
        }
        
        
            
    }, []);
    
    return (
        <DesiredPresenceContext.Provider value={[desiredPresence, setDesiredPresence]}>
            <SelfIdContext.Provider value={selfId}>
                <UsernameContext.Provider value={[username, changeUsername]}>
                    <AvatarContext.Provider value={[EMOTICONS[avatar], avatar, changeAvatar]}>
                        <AccountControlsContext.Provider value={[signUp, signIn, enterWorld, exitWorld]}>
                            {children}
                        </AccountControlsContext.Provider>
                    </AvatarContext.Provider>
                </UsernameContext.Provider>
            </SelfIdContext.Provider>
        </DesiredPresenceContext.Provider>
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
