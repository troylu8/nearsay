"use client"

import { useAvatar, useUid, useUsername } from "./contexts/account-providers";
import { useNotifications } from "./contexts/notifications-provider";

export default function Testing() {

    const uid = useUid();
    const username = useUsername()[0];
    const avatar = useAvatar()[0];
    
    const sendNotif = useNotifications();
    
    return (
        <>
            <div 
                className="fixed left-3 top-1/2 flex flex-col bg-primary p-3"
                onClick={() => sendNotif("asdaaaaaaaaaaaaaaa")}
            >
                <p>uid: {uid ?? "null"}</p>
                <p>username: {username ?? "null"}</p>
                <p>avatar: {avatar}</p>
            </div>
        </>
    );
}