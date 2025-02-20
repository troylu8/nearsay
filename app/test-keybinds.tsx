"use client"

import { useEffect } from "react";

export default function TestKeybinds() {

    useEffect(() => {
        
        function test(e: KeyboardEvent) {
            if (e.key == "a") {
                console.dir(process.env);
            }
        }
        
        window.addEventListener("keypress", test);

        return () => window.removeEventListener("keypress", test);
    }, []);


    return <></>;
}