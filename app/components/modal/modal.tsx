"use client";

import { MouseEvent } from "react";
import Link from "next/link";
import ColoredSvg from "../colored-svg";
import { useRouter } from "next/navigation";

type Prop = {
    title: string;
    children: React.ReactNode;
    onClose?: () => any;
};
export default function Modal({ title, children, onClose }: Prop) {
    const router = useRouter();
    
    let mousePressed = false;

    function handleClose() {
        mousePressed = false;
        if (onClose) onClose();
        else router.replace("/", { scroll: false });
    }

    return (
        <div
            className="fixed top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center bg-[#00000058] z-10"
            onMouseDown={e => { if (e.target === e.currentTarget) mousePressed = true }}
            onMouseUp={(e) => { if (e.target === e.currentTarget && mousePressed) handleClose() }}
        >
            <div className="w-[80%] max-h-[80%] bg-white rounded-md flex flex-col">
                <div className="p-3 flex justify-start relative">
                    <Link href="/" scroll={false}>
                        <ColoredSvg
                            src={"/icons/back.svg"}
                            width={25}
                            height={25}
                            color="black"
                            onClick={handleClose}
                        />
                    </Link>

                    <h2 className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                        {title}
                    </h2>
                </div>

                {children}
            </div>
        </div>
    );
}
