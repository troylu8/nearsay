"use client";

import { useState } from "react";
import TextInput from "../components/text-input";
import Modal from "../components/modal/modal";
import {  useUsername } from "@/app/contexts/account-providers";
import { useNotifications } from "@/app/contexts/notifications-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function EditProfile() {

    const sendNotification = useNotifications();
    const [username, changeUsername] = useUsername();

    const [newUsername, setNewUsername] = useState(username ?? "");
    const [usernameErr, setUsernameErr] = useState<string | null>(null);
    function verifyUsernameInput(newUsername: string) {
        if (newUsername == "") {
            setUsernameErr("username cannot be empty");
            return false;
        }
        else if (username == newUsername) {
            setUsernameErr("that's already your username");
            return false;
        }
        else {
            setUsernameErr(null);
            return true;
        }
    }

    async function handleChangeUsername() {
        if (verifyUsernameInput(newUsername)) {
            //TODO: loading bar
            try {
                await changeUsername(newUsername);
                sendNotification(`username changed! hello, ${newUsername}`);
            }
            catch (err: any) {
                if (err.code == 409)        setUsernameErr("username taken");
                else                        sendNotification("server error");
            }
        }
    }

    if (!username) {
        return (
            <Modal title="edit profile">
                <p> <Link href="/sign-in" scroll={false}> sign in </Link> to edit your profile ~ </p>
                //TODO: emoticon here
            </Modal>
        );
    }

    return (
        <Modal title="edit profile">
            <label>username</label>
            <div className="flex gap-3">
                <TextInput 
                    textState={[newUsername ?? "", username => {
                        setNewUsername(username);
                        verifyUsernameInput(username);
                    }]} 
                    valid={usernameErr == null}
                />
                <button onClick={handleChangeUsername}>apply</button>
            </div>
            <p>{usernameErr}</p>
        </Modal>
    );
}