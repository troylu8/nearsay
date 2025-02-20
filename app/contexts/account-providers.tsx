"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

type StatePair<T> = [T, Dispatch<SetStateAction<T>>];
const JWTContext = createContext<StatePair<string | null> | null>(null);
const UsernameContext = createContext<StatePair<string | null> | null>(null);
const AvatarContext = createContext<StatePair<number> | null>(null);

export function useJwt() { return useContext(JWTContext)!; }
export function useUsername() { return useContext(UsernameContext)!; }
export function useAvatar() { return useContext(AvatarContext)!; }

type Props = {
    children: React.ReactNode;
};
export default function AccountContextProvider({ children }: Props) {
    const jwtState = useState<string | null>(null);
    const usernameState = useState<string | null>(null);
    const avatarState = useState<number>(0);

    return (
        <JWTContext.Provider value={jwtState}>
            <UsernameContext.Provider value={usernameState}>
                <AvatarContext.Provider value={avatarState}>
                    {children}
                </AvatarContext.Provider>
            </UsernameContext.Provider>
        </JWTContext.Provider>
    );
}
