"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "../modal";
import { sendPostRequest } from "@/lib/server";
import ResizingTextArea from "../resizing-text-area";

type Props = {
    pos: google.maps.LatLng;
    onDone: (e: "clicked-post" | "closed") => any;
};
export default function PostDrafter({ pos, onDone }: Props) {
    const [body, setBody] = useState("");

    function handlePost() {
        onDone("clicked-post");
        sendPostRequest([pos.lng(), pos.lat()], body);
    }

    return (
        <Modal title="create" onClose={() => onDone("closed")}>
            {/* <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="leave a message..."
                className="
                        m-5 p-3  rounded-md
                        focus:outline-none focus:outline-solid focus:outline-2 focus:outline-black"
            /> */}
            <ResizingTextArea
                placeholder="leave a message..."
                value={body}
                onInput={setBody}
            />
            <button onClick={handlePost}> post </button>
        </Modal>
    );
}
