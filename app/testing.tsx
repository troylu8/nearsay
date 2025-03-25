"use client"

import { useAvatar, useUid, useUsername } from "./contexts/account-providers";

export default function Testing() {

    const uid = useUid();
    const username = useUsername()[0];
    const avatar = useAvatar()[0];
    
    return (
        <>
            <div 
                className="fixed left-3 top-3 flex flex-col bg-slate-400 p-3"
            >
                <p>uid: {uid ?? "null"}</p>
                <p>username: {username ?? "null"}</p>
                <p>avatar: {avatar}</p>
            </div>
        </>
    );
}