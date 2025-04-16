"use client";

import { useEffect, useState } from "react";
import ColoredSvg from "./colored-svg";
import { useNotifications } from "../contexts/notifications-provider";
import Link from "next/link";
import { useAccountControls, usePresence, useJWT, useUsername } from "../contexts/account-providers";


export default function HamburgerMenu() {
    
    const [presence, setPresence] = usePresence();
    
    const [username, _] = useUsername();
    const signOut = useAccountControls()[2];

    async function handleSignOut() {
        await signOut();
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
            <div className={` w-3 h-3 rounded-full ${presence? "bg-green-600" : "border-gray-300 border-[3px]"}`}></div>
            <p className="[--outline-color:white] text-outline"> {username ?? "[browsing anonymously]"} </p>
            <div className="relative bg-primary rounded-md p-2">
                <ColoredSvg 
                    src={showDropdown? "/icons/x.svg" : "/icons/hamburger.svg"} 
                    width={20} 
                    height={20} 
                    color="var(--color-background)" 
                />
                
                <div 
                    className={`
                        absolute top-full mt-3 right-0 ${showDropdown? "flex" : "hidden"} 
                        flex-col items-end click-through-container min-w-[140px]
                        whitespace-nowrap bg-primary rounded-md text-center 
                        p-5 gap-4 text-xl md:p-3 md:gap-0 md:text-base
                        [&>*]:text-background [&>*]:no-underline
                        [&>*]:rounded-md [&>*]:w-full
                        [&>*]:hover:underline [&>*]:decoration-2! underline-offset-4
                        [&>*]:hover:italic 
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    {   
                        username == null ?
                        (<>
                            <Link href="/sign-up" scroll={false}> create account </Link>
                            <Link href="/sign-in" scroll={false}> sign in </Link>
                        </>) :
                        (<>
                            <button onClick={handleSignOut}> sign out </button>
                        </>)
                    }
                    <Link href="/edit-appearance" scroll={false}> edit appearance </Link>
                    <button onClick={() => setPresence(!presence)}> {presence? "go invisible" : "become visible"} </button>
                    
                </div>
            </div>
        </div>
    );
}