"use client";

import { useEffect, useState } from "react";
import ColoredSvg from "./colored-svg";
import { useNotifications } from "../contexts/notifications-provider";
import Link from "next/link";
import { useAccountControls, useDesiredPresence, useJWT, useUsername } from "../contexts/account-providers";


export default function HamburgerMenu() {
    
    const signedOut = useJWT() == undefined;
    const [desiredPresence, setDesiredPresence] = useDesiredPresence();
    const invisible = !signedOut && desiredPresence;
    
    const [username, _] = useUsername();
    const exitWorld = useAccountControls()[3];

    async function handleSignOut() {
        await exitWorld(true);
        localStorage.removeItem("jwt");
        sendNotification("signed out!");
    }
    
    const [showDropdown, setShowDropdown] = useState(false);
    
    useEffect(() => {
        function hideDropdown() { setShowDropdown(false) };
        window.addEventListener("mousedown", hideDropdown);
        return () => window.removeEventListener("mousedown", hideDropdown);
    }, []);

    const sendNotification = useNotifications();
    
    return (
        <div 
            className="fixed top-3 right-3 flex items-center gap-3 cursor-pointer"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setShowDropdown(!showDropdown)}
        >
            <div className={` w-3 h-3 rounded-full ${invisible? "bg-green-600" : "border-gray-300 border-[3px]"}`}></div>
            <p> {signedOut? "[signed out]" : username ?? "[signed in as guest]"} </p>
            <div className="relative bg-slate-400 rounded-md p-2">
                <ColoredSvg src={showDropdown? "/icons/x.svg" : "/icons/hamburger.svg"} width={20} height={20} color="white" />
                
                <div 
                    className={`
                        absolute top-full mt-3 right-0 ${showDropdown? "flex" : "hidden"} flex-col items-center
                        rounded-md bg-slate-400 p-3 whitespace-nowrap
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    { username == null ?
                        (<>
                            <Link href="/sign-up" scroll={false}> create account </Link>
                            <Link href="/sign-in" scroll={false}> sign in </Link>
                        </>) :
                        (<>
                            <Link href="/edit-profile" scroll={false}> edit profile </Link>
                            <button onClick={handleSignOut}> sign out </button>
                        </>)
                    }
                    
                    <button onClick={() => setDesiredPresence(!desiredPresence)}> {desiredPresence? "go invisible" : "become visible"} </button>
                    
                </div>
            </div>
        </div>
    );
}