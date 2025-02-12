"use client";

import { useState } from "react";
import Modal from "./modal";
import ResizingTextArea from "../resizing-text-area";
import { sendPostEvent } from "@/lib/data";

type Props = {
    pos: google.maps.LatLng;
    onPost?: () => any;
    onCancel?: () => any;
};
export default function CreatePostModal({ pos, onPost, onCancel }: Props) {
    const [body, setBody] = useState("");

    function handlePost() {
        sendPostEvent([pos.lng(), pos.lat()], body);
        if (onPost) onPost();
    }

    return (
        <Modal title="create" onClose={() => {if (onCancel) onCancel()}}>
            <ResizingTextArea
                placeholder="leave a message..."
                value={body}
                onInput={setBody}
            />
            <button onClick={handlePost}> post </button>
        </Modal>
    );
}
