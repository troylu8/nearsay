"use client";

import { useState } from "react";
import Modal from "./modal";
import ResizingTextArea from "../resizing-text-area";
import { socketfetch } from "@/lib/server";

type Props = {
    pos: google.maps.LatLng;
    onPost?: () => any;
    onCancel?: () => any;
};
export default function CreatePostModal({ pos, onPost, onCancel }: Props) {
    const [body, setBody] = useState("");

    function handlePost() {
        socketfetch("post", {pos: [pos.lng(), pos.lat()], body})
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
