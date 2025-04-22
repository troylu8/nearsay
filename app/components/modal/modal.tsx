"use client";

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
            className="fixed top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center bg-[#2e151c57] z-10"
            onMouseDown={e => { if (e.target === e.currentTarget) mousePressed = true }}
            onMouseUp={(e) => { if (e.target === e.currentTarget && mousePressed) handleClose() }}
        >
            <div className="w-[calc(100%-30px)] max-w-md max-h-[80%] bg-background rounded-md flex flex-col outline-3 outline-primary">
                <div className="p-3 flex justify-end relative">
                    <Link href="/" scroll={false}>
                        <ColoredSvg
                            src={"/icons/x.svg"}
                            width={25}
                            height={25}
                            color="black"
                            onClick={handleClose}
                        />
                    </Link>

                    <h1 className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] font-bold text-primary md:text-lg">
                        {title}
                    </h1>
                </div>
                
                <div className="p-3 overflow-y-auto  ">
                    {children}
                </div>
            </div>
        </div>
    );
}
