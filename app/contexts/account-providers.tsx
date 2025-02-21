"use client";

import { clearStoredAccountInfo, getStoredAccountInfo, signInAsGuest } from "@/lib/account";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { toArrayCoords, useGeolocation } from "./geolocation-provider";

type Settings = {
    invisible: boolean
}

type StatePair<T> = [T, (next: T) => any];
const JWTContext = createContext<StatePair<string | null> | null>(null);
const UsernameContext = createContext<StatePair<string | null> | null>(null);
const AvatarContext = createContext<StatePair<number | null> | null>(null);
const SettingsContext = createContext<StatePair<Settings> | null>(null);

export function useJwt() { return useContext(JWTContext)!; }
export function useUsername() { return useContext(UsernameContext)!; }
export function useAvatar() { return useContext(AvatarContext)!; }
export function useSettings() { return useContext(SettingsContext)!; }

function bindToLocalStorage<T>(key: string, setter: (next: T | null) => any) {
    return (next: T | null) => {
        setter(next);

        if (next)   localStorage.setItem(key, "" + next);
        else        localStorage.removeItem(key);
    }
}

type Props = {
    children: React.ReactNode;
};
export default function AccountContextProvider({ children }: Props) {
    const [jwt, setJWT] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<number | null>(null);
    const [settings, setSettings] = useState<Settings>({
        invisible: false
    });

    //TODO: settings


    const geolocation = useGeolocation();
    
    useEffect(() => {

        const accountInfo = getStoredAccountInfo();
        
        if (accountInfo) {
            setJWT(accountInfo[0]);
            setUsername(accountInfo[1]);
            setAvatar(accountInfo[2]);
        }
        else {
            clearStoredAccountInfo();
            const randomAvatar = Math.floor(Math.random() * 10);

            if (geolocation.userPos) {
                signInAsGuest(toArrayCoords(geolocation.userPos), randomAvatar)
                    .then(returnedJwt => {
                        setJWT(returnedJwt)
                        setAvatar(randomAvatar);
                    })

                    // only possible error code is 500
                    .catch(() => console.log("error signing in as guest")); 
            }
            else {
                console.log("error getting geolocation");
            }
            
        }

    }, []);

    return (
        <JWTContext.Provider value={[jwt, bindToLocalStorage("jwt", setJWT)]}>
            <UsernameContext.Provider value={[username, bindToLocalStorage("username", setUsername)]}>
                <AvatarContext.Provider value={[avatar, bindToLocalStorage("avatar", setAvatar)]}>
                    <SettingsContext.Provider value={[settings, setSettings]}>
                        {children}
                    </SettingsContext.Provider>
                </AvatarContext.Provider>
            </UsernameContext.Provider>
        </JWTContext.Provider>
    );
}
