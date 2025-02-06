"use client";

import { useState } from "react";
import Modal from "../components/modal";
import TextInput from "../components/text-input";
import { sendNewUserRequest } from "@/lib/data";

export default function SignUp() {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [passwordRepeated, setPasswordRepeated] = useState("");
    let [complaint, setComplaint] = useState("");
    let [signingIn, setSigningIn] = useState(false);

    function getPasswordComplaint(p1: string, p2: string) {
        if (!/[a-zA-Z]/.test(p1)) {
            return "password must include a letter";
        }
        if (!/[^a-zA-Z]/.test(p1)) {
            return "password must include a number or symbol";
        }
        if (p1 != p2) {
            return "passwords don't match";
        }
        return "";
    }

    async function handleSubmit() {
        // submit was clicked when signing in
        if (signingIn) {
        }

        // submit was clicked when creating an account
        else if (complaint == "") {
            try {
                await sendNewUserRequest(username, password);
            } catch (e) {
                const err = e as Error;
                if (err.message == "username taken") {
                    //TODO:
                }
            }
        }
    }

    return (
        <Modal title={signingIn ? "sign in" : "create an account"}>
            <TextInput
                textState={[username, setUsername]}
                placeholder="username"
            />
            <TextInput
                //TODO: type="password"
                textState={[
                    password,
                    (password) => {
                        setPassword(password);
                        if (!signingIn) {
                            setComplaint(
                                getPasswordComplaint(password, passwordRepeated)
                            );
                        }
                    },
                ]}
                placeholder="password"
                valid={complaint == ""}
            />

            {!signingIn && (
                <>
                    <TextInput
                        //TODO: type="password"
                        textState={[
                            passwordRepeated,
                            (repeated) => {
                                setPasswordRepeated(repeated);
                                setComplaint(
                                    getPasswordComplaint(password, repeated)
                                );
                            },
                        ]}
                        placeholder="repeat password"
                        valid={complaint == ""}
                    />
                    <p>{complaint}</p>
                </>
            )}

            <button onClick={handleSubmit}>
                {signingIn ? "sign in" : "create"}
            </button>
            <button onClick={() => setSigningIn(!signingIn)}>
                {signingIn ? "create an account" : "i already have an account"}
            </button>
        </Modal>
    );
}
