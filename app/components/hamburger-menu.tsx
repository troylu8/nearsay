"use client";

import { useEffect, useState } from "react";
import ColoredSvg from "./colored-svg";
import { useNotifications } from "../contexts/notifications-provider";
import Link from "next/link";
import { useAccountControls, useUsername } from "../contexts/account-providers";


export default function HamburgerMenu() {

    const [username, _] = useUsername();
    const signOut = useAccountControls()[2];

    function handleSignOut() {
        signOut();
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
            <p>{username ?? "[signed out]"}</p>
            <div className="relative bg-slate-400 rounded-md p-2">
                <ColoredSvg src={showDropdown? "/icons/x.svg" : "/icons/hamburger.svg"} width={20} height={20} color="white" />
                
                <div 
                    className={`
                        absolute top-full mt-3 right-0 ${showDropdown? "flex" : "hidden"} flex-col items-center
                        rounded-md bg-slate-400 p-3 whitespace-nowrap
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    {username?
                        (<>
                            <Link href="/edit-profile" scroll={false}> edit profile </Link>
                            <button onClick={handleSignOut}> sign out </button>
                        </>) :
                        (<>
                            <Link href="/sign-up" scroll={false}> create account </Link>
                            <Link href="/sign-in" scroll={false}> sign in </Link>
                        </>)
                    }

                    <Link href="/settings" scroll={false}> settings </Link>
                    
                </div>
            </div>
        </div>
    );
}