"use client";

import { useState } from "react";
import Modal from "../components/modal";
import { sendPostRequest } from "@/lib/data";
import { useGeolocation } from "../components/geolocation-context-provider";

export default function CreatePost() {
    const { userPos } = useGeolocation();
    const [body, setBody] = useState("");

    async function handlePost() {
        const resp = await sendPostRequest([userPos!.lng, userPos!.lat], body);
        //TODO: success/fail notif
        console.log(resp);
    }

    return (
        <Modal title="create">
            <input
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
            <button onClick={handlePost}> post </button>
        </Modal>
    );
}
