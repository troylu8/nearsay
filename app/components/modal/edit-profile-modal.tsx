import { useState } from "react";
import TextInput from "../text-input";
import Modal from "./modal";
import { useUsername } from "@/app/contexts/account-providers";
import { useNotifications } from "@/app/contexts/notifications-provider";
import { emitAsync } from "@/lib/server";


export default function EditProfile() {
    const sendNotification = useNotifications();
    const [username, setUsername] = useUsername();

    const [newUsername, setNewUsername] = useState(username ?? "");
    const [usernameErr, setUsernameErr] = useState<string | null>(null);
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

    async function handleUsernameChange() {
        if (verifyUsernameInput(newUsername)) {
            //TODO: loading bar
            try {
            }
            catch (err: any) {
                if (err.code == 409)        setUsernameErr("username taken");
                else                        sendNotification("server error");
            }
        }
    }

    return (
        <Modal title="edit profile">
                <label>username</label>
                <div className="flex gap-3">
                    <TextInput textState={[username ?? "", username => {
                        setUsername(username);
                        verifyUsernameInput(username);
                    }]} />
                    <button onClick={handleUsernameChange}>apply</button>
                </div>
        </Modal>
    );
}