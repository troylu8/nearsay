"use client"

import { useEffect } from "react";
import { useAccountControls, useAvatar, useJwt, useUsername } from "./contexts/account-providers";

export default function TestKeybinds() {

    // const jwt = useJwt();
    // const username = useUsername()[0];
    // const avatar = useAvatar()[0];

    // const signOut = useAccountControls()[2];

    // useEffect(() => {
        
    //     function test(e: KeyboardEvent) {
    //         console.log("pressed", e.key);
    //         if (e.key == "a") {
    //             console.dir(process.env);
    //         }
    //         if (e.key == "b") {
    //             signOut(false);
    //         }
    //         if (e.key == "e") {
    //             console.log({jwt, username, avatar});
    //         }
    //     }
        
    //     window.addEventListener("keypress", test);

    //     return () => window.removeEventListener("keypress", test);
    // });


    return <></>;
}