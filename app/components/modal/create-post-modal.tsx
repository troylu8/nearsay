"use client";

import { useState } from "react";
import Modal from "./modal";
import LimitedTextArea from "../resizing-text-area";
import { socketfetch } from "@/lib/server";
import { UIButton } from "../colored-svg";
import { useJWT } from "@/app/contexts/account-providers";

type Props = {
    pos: google.maps.LatLng;
    onPost?: () => any;
    onCancel?: () => any;
};
export default function CreatePostModal({ pos, onPost, onCancel }: Props) {
    const jwt = useJWT();
    const [body, setBody] = useState("");

    function handlePost() {
        socketfetch("post", {jwt, pos: [pos.lng(), pos.lat()], body})
        if (onPost && body.length <= 500) onPost();
    }

    return (
        <Modal title="leave a note" onClose={() => {if (onCancel) onCancel()}}>
            <div className="flex flex-col gap-3 max-h-full">
                <LimitedTextArea
                    placeholder="tell the world what you think..."
                    bind={[body, setBody]}
                    maxChars={500}
                />
                
                <UIButton
                    src="/icons/send.svg"
                    iconSize={20}
                    onClick={handlePost}
                    className="self-center flex-row-reverse px-4"
                >
                    post    
                </UIButton>
                
            </div>
        </Modal>
    );
}
