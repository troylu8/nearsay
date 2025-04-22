"use client";

import { useState } from "react";
import BindedInput from "../components/text-input";
import Modal from "../components/modal/modal";
import {  useAccountControls, useAvatar, useUsername } from "@/app/contexts/account-providers";
import { useNotifications } from "@/app/contexts/notifications-provider";
import Link from "next/link";

import { EMOTICONS } from "@/lib/emoticon";
import { useRouter } from "next/navigation";


export default function EditProfile() {
    return (
        <Modal title="appearance">
            <div className="flex flex-col gap-6">
                <UsernameEditor/>
                <AvatarEditor/>
                <DeleteAccount/>
            </div>
        </Modal>
    );
}

function AvatarEditor() {
    const [avatar, _, changeAvatar] = useAvatar();
    const sendNotification = useNotifications();

    async function handleChangeAvatar(next: number) {
        try {
            await changeAvatar(next);
        }
        catch (e) {
            console.error(e);
            sendNotification("server error when changing avatar");
        }
    }
    return (
        <div>
            <h2> change emoticon </h2>
            <div className="flex flex-wrap justify-center gap-1 mt-4">
                {
                    EMOTICONS.map((e, i) => 
                        <div 
                            key={i} 
                            className={`
                                avatar-frame self-center cursor-pointer mb-6
                                ${(avatar == e) && "bg-success"}
                            `}
                            onClick={() => handleChangeAvatar(i)}
                        >
                            {e}
                            {avatar == e && (
                                <p className="
                                    absolute top-full mt-1 left-1/2 -translate-x-1/2 
                                    text-success text-sm
                                ">
                                    [selected]
                                </p>
                            )}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

function DeleteAccount() {
    const username = useUsername()[0];
    const sendNotification = useNotifications();
    const [_, __, signOut] = useAccountControls();
    const router = useRouter();

    const [confirmation, setConfirmation] = useState("");
    
    const CONFIRM_MESSAGE = `delete ${username}`;

    async function handleDeleteAccount() {
        if (confirmation != CONFIRM_MESSAGE) return;

        try {
            await signOut(true);
            sendNotification("account successfully deleted");
            router.replace("/", {scroll: false});
        }
        catch (_) {
            sendNotification("error deleting your account");
        }
    }

    return username && (
        <div className="mt-5">
            <h2> delete account </h2>
            <p>type "{CONFIRM_MESSAGE}" to confirm</p>
            <div className="flex gap-3 mt-1">
                <BindedInput 
                    bind={[confirmation, setConfirmation]} 
                    valid={confirmation == CONFIRM_MESSAGE}
                    placeholder={CONFIRM_MESSAGE}
                />
                <button onClick={handleDeleteAccount} disabled={confirmation != CONFIRM_MESSAGE}>delete!</button>
            </div>
        </div>
    )
}

function UsernameEditor() {
    const sendNotification = useNotifications();
    const [username, changeUsername] = useUsername();

    const [newUsername, setNewUsername] = useState("");
    const [usernameErr, setUsernameErr] = useState<string | null>(null);
    
    const [requestActive, setRequestActive] = useState(false); 
    
    function verifyUsernameInput(newUsername: string) {
        if (newUsername == "") {
            setUsernameErr("username can't be empty");
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
        if (!requestActive && verifyUsernameInput(newUsername)) {
            try {
                setRequestActive(true);
                await changeUsername(newUsername);
                setRequestActive(false);
                setNewUsername("");
                sendNotification(`username changed! hello, ${newUsername}`);
            }
            catch (err: any) {
                if (err.code == 409)        setUsernameErr("username taken");
                else                        sendNotification("server error");
            }
        }
    }

    return (
        <div>
            <h2> change username </h2>
            {
                username == null ?
                <p> (✧ω✧)☞ <Link href="/sign-in" scroll={false}>sign in</Link> to edit your username </p> :
                <>
                    <div className="flex gap-x-3 ">
                        <BindedInput 
                            bind={[newUsername ?? "", username => {
                                setNewUsername(username);
                                verifyUsernameInput(username);
                            }]} 
                            valid={usernameErr == null}
                            placeholder="new username.."
                            onSubmit={handleChangeUsername}
                        />
                        <button onClick={handleChangeUsername}>{requestActive? "..." : "apply"}</button>
                    </div>
                    {usernameErr && <p className="text-failure"> (;°Д°) {usernameErr}</p>}
                </>
            }
        </div>
    );
}