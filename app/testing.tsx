"use client"

import { useEffect } from "react";
import { useAccountControls, useAvatar, useJwt, useUsername } from "./contexts/account-providers";

export default function Testing() {

    const jwt = useJwt();
    const username = useUsername()[0];
    const avatar = useAvatar()[0];
    
    function parseJwt(token: string) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }

    return (
        <div className="fixed left-3 top-3 flex flex-col bg-slate-400 p-3">
            <p>uid: {jwt? parseJwt(jwt).uid : "null"}</p>
            <p>username: {username ?? "null"}</p>
            <p>avatar: {avatar}</p>
        </div>
    );
}