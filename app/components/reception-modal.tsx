"use client";

import { useEffect, useState } from "react";
import Modal from "./modal";
import TextInput from "./text-input";
import { sendNewUserRequest } from "@/lib/data";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
    initialMode: "sign-in" | "sign-up";
};
export default function ReceptionModal({ initialMode }: Props) {
    const router = useRouter();
    const origin = useSearchParams().get("origin") ?? "/";

    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [passwordRepeated, setPasswordRepeated] = useState("");
    let [complaint, setComplaint] = useState("");
    let [signInMode, setSignInMode] = useState(initialMode == "sign-in");

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
        if (signInMode) {
        }

        // submit was clicked when creating an account
        else if (complaint == "") {
            try {
                //TODO: loading bar
                await sendNewUserRequest(username, password);

                //TODO: send notification

                console.log("success, returning to ", origin);
                router.replace(origin, { scroll: false });
            } catch (e) {
                const err = e as Error;
                if (err.message == "username taken") {
                    //TODO: send notification
                }
            }
        }
    }

    return (
        <Modal title={signInMode ? "sign in" : "create an account"}>
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
                        if (!signInMode) {
                            setComplaint(
                                getPasswordComplaint(password, passwordRepeated)
                            );
                        }
                    },
                ]}
                placeholder="password"
                valid={complaint == ""}
            />

            {!signInMode && (
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
                {signInMode ? "sign in" : "create"}
            </button>
            <button onClick={() => setSignInMode(!signInMode)}>
                {signInMode ? "create an account" : "i already have an account"}
            </button>
        </Modal>
    );
}
