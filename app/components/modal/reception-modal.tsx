"use client";

import { useState } from "react";
import Modal from "./modal";
import TextInput from "../text-input";
import { useNotifications } from "@/app/contexts/notifications-context-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/account";

type Props = {
    mode: "sign-in" | "sign-up";
    onSuccess?: () => any
};
export default function ReceptionModal({ mode, onSuccess }: Props) {

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

            const status = await signIn(username, password);
            
            if (status == 401)         setPasswordErr("wrong password");
            else if (status == 404)    setUsernameErr("username doesnt exist");
            else if (status == 500)    sendNotification("server error");
            else /* if (status == 200) */ {
                sendNotification(<p> signed in! welcome, {username} </p>);
                onSuccess!();
            }
        }

        // submit was clicked when creating an account
        else if (verifyUsernameInput(username) && verifyPasswordsInput(password, passwordRepeated)) {

            //TODO: loading bar
            const status = await signUp(username, password);

            if (status == 409)         setUsernameErr("username taken");
            else if (status == 500)    sendNotification("server error");
            else /*if (status == 200)*/ {
                sendNotification(`account created! welcome, ${username}`);
                onSuccess!();
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
