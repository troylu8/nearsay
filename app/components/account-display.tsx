"use client";

import { useEffect, useState } from "react";
import ColoredSvg from "./colored-svg";
import { username as initialUsername, addUsernameChangedHandler, removeUsernameChangedHandler, signOut, signInFromLocalStorage } from "@/lib/account";
import { useNotifications } from "../contexts/notifications-provider";
import Link from "next/link";


export default function AccountDisplay() {

    const [username, setUsername] = useState<string | null>(initialUsername);
    function handleSignOut() {
        signOut();
        sendNotification("signed out!");
    }
    
    const [showDropdown, setShowDropdown] = useState(false);
    
    useEffect(() => {
        signInFromLocalStorage();
        
        addUsernameChangedHandler(setUsername);
        
        function hideDropdown() { setShowDropdown(false) };
        window.addEventListener("mousedown", hideDropdown);

        return () => {
            removeUsernameChangedHandler(setUsername);
            window.removeEventListener("mousedown", hideDropdown);
        };
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
                <ColoredSvg src={showDropdown? "/icons/x.svg" : "/icons/profile.svg"} width={20} height={20} color="white" />
                
                <div 
                    className={`
                        absolute top-full mt-3 right-0 ${showDropdown? "flex" : "hidden"} flex-col items-center
                        rounded-md bg-slate-400 p-3 whitespace-nowrap
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    {username?
                        (<>
                            <button>edit profile</button>
                            <button onClick={handleSignOut}>sign out</button>
                        </>) :
                        (<>
                            <Link href="/sign-up" scroll={false}>create account</Link>
                            <Link href="/sign-in" scroll={false}>sign in</Link>
                        </>)
                    }
                    
                    
                </div>
            </div>
        </div>
    );
}