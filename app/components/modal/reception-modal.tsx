"use client";

import { useState } from "react";
import Modal from "./modal";
import BindedInput from "../text-input";
import { useNotifications } from "@/app/contexts/notifications-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccountControls } from "@/app/contexts/account-providers";

type Props = {
    mode: "sign-in" | "sign-up";
    onSuccess?: () => any
};
export default function ReceptionModal({ mode, onSuccess }: Props) {

    const [signUp, signIn, _] = useAccountControls();

    const router = useRouter();
    const searchParams = useSearchParams();
        
    onSuccess = onSuccess ?? (() => {
        router.replace(searchParams.get("origin") ?? "/", {scroll: false});
    });
    
    const sendNotification = useNotifications();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeated, setPasswordRepeated] = useState("");

    const [usernameErr, setUsernameErr] = useState<string | null>(null);
    const [passwordErr, setPasswordErr] = useState<string | null>(null);
    
    const [submitClicked, setSubmitClicked] = useState(false);

    function verifyUsernameInput(newUsername: string) {
        if (newUsername.length == 0) {
            setUsernameErr("username can't be empty");
            return false;
        }
        else if (newUsername.length > 50) {
            setUsernameErr("username too long");
            return false;
        }
        else {
            setUsernameErr(null);
            return true;
        }
    }
    function verifyPasswordsInput(p1: string, p2: string) {
        if (!/[a-zA-Z]/.test(p1)) {
            setPasswordErr("password must include a letter");
        }
        else if (!/[^a-zA-Z]/.test(p1)) {
            setPasswordErr("password must include a number or symbol");
        }
        else if (p1 != p2) {
            setPasswordErr("passwords don't match");
        }
        else {
            setPasswordErr(null);
            return true;
        };
        return false;
    }

    const currentlySigningIn = mode == "sign-in";

    function switchModes() {
        const paramsStr = searchParams.size > 0? "?" + searchParams.toString() : "";
        router.replace(
            (currentlySigningIn? "/sign-up" : "/sign-in") + paramsStr, 
            {scroll: false}
        );
    }


    async function handleSubmit() {
        if (submitClicked) return;
        setSubmitClicked(true);
        
        // submit was clicked when signing in
        if (currentlySigningIn && verifyUsernameInput(username)) {

            try {
                await signIn(username, password);

                sendNotification(`signed in! welcome, ${username}`);
                onSuccess!();
            }
            catch (err: any) {
                console.error(err);
                if (err.code == 401)            setPasswordErr("wrong password");
                else if (err.code == 404)       setUsernameErr("username doesnt exist");
                else if (err.code == 500)       sendNotification("server error");
                else                            sendNotification(`unexpected error: ${err}`);
            }
        }

        // submit was clicked when creating an account
        else if (verifyUsernameInput(username) && verifyPasswordsInput(password, passwordRepeated)) {

            try {
                await signUp(username, password, true);

                sendNotification(`account created! welcome, ${username}`);
                onSuccess!();
            }
            catch (err: any) {
                console.error(err);
                if (err.code == 409)        setUsernameErr("username taken");
                else                        sendNotification("server error");
            }
        }
        
        setSubmitClicked(false);
    }

    return (
        <Modal title={currentlySigningIn ? "sign in" : "create an account"}>
            <div className="flex flex-col gap-3">
                <div>
                    <h3> username </h3>
                    <BindedInput
                        bind={[username, username => {
                            setUsername(username);
                            verifyUsernameInput(username);
                        }]}
                        placeholder="username"
                        valid={usernameErr == null}
                        className="w-full"
                        maxChars={50}
                        onSubmit={handleSubmit}
                    />
                </div>
                <div>
                    <h3> password </h3>
                    <BindedInput
                        type="password"
                        bind={[password,setPassword]}
                        placeholder="password"
                        valid={passwordErr == null}
                        className="w-full"
                        onSubmit={handleSubmit}
                    />
                </div>

                {!currentlySigningIn && 
                    <BindedInput
                        type="password"
                        bind={[passwordRepeated,setPasswordRepeated]}
                        placeholder="repeat password"
                        valid={passwordErr == null}
                        className="w-full"
                        onSubmit={handleSubmit}
                    />
                }
        
                {(usernameErr || passwordErr) && <p className="text-failure"> (;°Д°) {usernameErr ?? passwordErr}</p>}
                
                <button onClick={handleSubmit} className="self-center px-10 text-lg">
                    {submitClicked? "..." : currentlySigningIn ? "sign in" : "create"}
                </button>
                <button onClick={switchModes} className="bg-background text-primary underline">
                    {currentlySigningIn ? "create an account" : "i already have an account"}
                </button>
            </div>
        </Modal>
    );
}
