"use client";

import { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ColoredSvg from "./colored-svg";

type Prop = {
    title: string;
    children: React.ReactNode;
};
export default function Modal({ title, children }: Prop) {
    const router = useRouter();

    function handleClose(e: MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            router.replace("/", { scroll: false });
        }
    }

    return (
        <div
            className="fixed w-full h-full flex flex-col justify-center items-center bg-[#00000058]"
            onClick={handleClose}
        >
            <div className="w-[80%] max-h-[80%] bg-white flex flex-col">
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
