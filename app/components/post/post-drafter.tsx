"use client";

import { useState } from "react";
import Modal from "../modal";
import { sendPostEvent } from "@/lib/data";
import ResizingTextArea from "../resizing-text-area";

type Props = {
    pos: google.maps.LatLng;
    onDone: (e: "clicked-post" | "closed") => any;
};
export default function PostDrafter({ pos, onDone }: Props) {
    const [body, setBody] = useState("");

    function handlePost() {
        onDone("clicked-post");
        sendPostEvent([pos.lng(), pos.lat()], body);
    }

    return (
        <Modal title="create" onClose={() => onDone("closed")}>
            <ResizingTextArea
                placeholder="leave a message..."
                value={body}
                onInput={setBody}
            />
            <button onClick={handlePost}> post </button>
        </Modal>
    );
}
