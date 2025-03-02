"use client";

import { useState } from "react";
import TextInput from "../components/text-input";
import Modal from "../components/modal/modal";
import {  useAccountControls, useUsername } from "@/app/contexts/account-providers";
import { useNotifications } from "@/app/contexts/notifications-provider";
import Link from "next/link";

import { EMOTICONS } from "@/lib/emoticon";


export default function EditProfile() {
    const signedIn = useUsername()[0] != null;

    if (!signedIn) {
        return (
            <Modal title="edit profile">
                <p> <Link href="/sign-in" scroll={false}> sign in </Link> to edit your profile ~ </p>
                //TODO: emoticon here
            </Modal>
        );
    }

    return (
        <Modal title="edit profile">
            <div className="flex flex-col gap-3">
                <UsernameEditor/>
                <AvatarEditor/>
                <DeleteAccount/>
            </div>
        </Modal>
    );
}

function DeleteAccount() {
    const username = useUsername()[0];
    const sendNotification = useNotifications();
    const signOut = useAccountControls()[2];

    const [confirmation, setConfirmation] = useState("");
    const [valid, setValid] = useState(true);

    async function handleDeleteAccount() {
        if (confirmation != username) {
            setValid(false);
            return;
        };

        try {
            await signOut(undefined, true); //TODO: confirmation
            sendNotification("account successfully deleted");
        }
        catch (_) {
            sendNotification("error deleting your account");
        }
    }

    return (
        <>
            <p>type "{username}" to confirm</p>
            <TextInput 
                textState={[confirmation, next => {
                    setConfirmation(next);
                    setValid(true);
                }]} 
                valid={valid}
                placeholder={username ?? undefined}
            />
            <button onClick={handleDeleteAccount}>delete account</button>
        </>
    )
}

function AvatarEditor() {
    return (
        <>
            <div className="grid grid-cols-5">
                {
                    EMOTICONS.map((e, i) => <div key={i} className="avatar">{e}</div>)
                }
            </div>
        </>
    )
}

function UsernameEditor() {
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

    return (
        <>
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
        </>
    );
}