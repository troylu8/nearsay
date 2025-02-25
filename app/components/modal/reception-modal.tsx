"use client";

import { useState } from "react";
import Modal from "./modal";
import TextInput from "../text-input";
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

    function verifyUsernameInput(username: string) {
        if (username == "") {
            setUsernameErr("username cannot be empty");
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
        
        // submit was clicked when signing in
        if (currentlySigningIn && verifyUsernameInput(username)) {
            //TODO: loading

            try {
                await signIn(username, password);

                sendNotification(`signed in! welcome, ${username}`);
                onSuccess!();
            }
            catch (err: any) {
                if (err.code == 401)            setPasswordErr("wrong password");
                else if (err.code == 404)       setUsernameErr("username doesnt exist");
                else                            sendNotification("server error");
            }
        }

        // submit was clicked when creating an account
        else if (verifyUsernameInput(username) && verifyPasswordsInput(password, passwordRepeated)) {

            //TODO: loading bar
            try {
                await signUp(username, password);

                sendNotification(`account created! welcome, ${username}`);
                onSuccess!();
            }
            catch (err: any) {
                if (err.code == 409)        setPasswordErr("username taken");
                else                        sendNotification("server error");
            }
        }
    }

    return (
        <Modal title={currentlySigningIn ? "sign in" : "create an account"}>
            <TextInput
                textState={[username, username => {
                    setUsername(username);
                    verifyUsernameInput(username);
                }]}
                placeholder="username"
                valid={usernameErr == null}
            />
            <TextInput
                //TODO: type="password"
                textState={[
                    password,
                    password => {
                        setPassword(password);
                        if (!currentlySigningIn) verifyPasswordsInput(password, passwordRepeated);
                    },
                ]}
                placeholder="password"
                valid={passwordErr == null}
            />

            {!currentlySigningIn && 
                <TextInput
                    //TODO: type="password"
                    textState={[
                        passwordRepeated,
                        (repeated) => {
                            setPasswordRepeated(repeated);
                            verifyPasswordsInput(password, repeated);
                        },
                    ]}
                    placeholder="repeat password"
                    valid={passwordErr == null}
                />
            }

            <p>{usernameErr ?? passwordErr}</p>
            <button onClick={handleSubmit}>
                {currentlySigningIn ? "sign in" : "create"}
            </button>
            <button onClick={switchModes}>
                {currentlySigningIn ? "create an account" : "i already have an account"}
            </button>
        </Modal>
    );
}
