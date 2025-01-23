"use client";

import { useState } from "react";
import Modal from "../components/modal";
import TextInput from "../components/text-input";

export default function SignUp() {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    let [passwordRepeated, setPasswordRepeated] = useState("");
    let [complaint, setComplaint] = useState("");

    function getPasswordComplaint(p1: string, p2: string) {
        if (!/[a-zA-Z]/.test(p1)) {
            return "password must include a letter";
        }
        if (!/[0-9]/.test(p1)) {
            return "password must include a number";
        }
        if (!/[^a-zA-Z0-9]/.test(p1)) {
            return "password must include a symbol";
        }
        if (p1 != p2) {
            return "passwords don't match";
        }
        return "";
    }

    function handleSubmit() {
        if (complaint == "") {
            console.log("submitted!");
        }
    }

    return (
        <Modal title="create an account">
            <TextInput
                textState={[username, setUsername]}
                placeholder="username"
            />
            <TextInput
                type="password"
                textState={[
                    password,
                    (password) => {
                        setPassword(password);
                        setComplaint(
                            getPasswordComplaint(password, passwordRepeated)
                        );
                    },
                ]}
                placeholder="password"
                valid={complaint == ""}
            />
            <TextInput
                type="password"
                textState={[
                    passwordRepeated,
                    (repeated) => {
                        setPasswordRepeated(repeated);
                        setComplaint(getPasswordComplaint(password, repeated));
                    },
                ]}
                placeholder="repeat password"
                valid={complaint == ""}
            />
            <p>{complaint}</p>
            <button onClick={handleSubmit}>create</button>
        </Modal>
    );
}
