"use client";

import ColoredSvg from "@/app/components/colored-svg";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Post } from "@/lib/data";
import { MouseEvent, useEffect, useState } from "react";
import { usePostPos } from "./post-pos-context-provider";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function toTimeDisplay(ms: number) {
    const sec = 1000;
    const min = sec * 60;
    const hr = min * 60;
    const day = hr * 24;
    if (ms > day) return Math.round(ms / day) + "d";
    if (ms > hr) return Math.round(ms / hr) + "h";
    if (ms > min) return Math.round(ms / min) + "m";
    return Math.round(ms / sec) + "s";
}

function msTilDay(day: number) {
    return typeof window === "undefined" ? 0 : day * DAY_IN_MS - Date.now();
}

enum PostInteraction {
    NONE,
    LIKE,
    DISLIKE,
}

type Props = {
    id: string;
    post: Post;
};
export default function PostViewer({ id, post }: Props) {
    const router = useRouter();
    const [_, updatePostPos] = usePostPos()!;

    const [interaction, setInteraction] = useState(PostInteraction.NONE);

    useEffect(() => updatePostPos(id, post.pos), []);

    function handleToggleLike() {
        setInteraction(
            interaction === PostInteraction.LIKE
                ? PostInteraction.NONE
                : PostInteraction.LIKE
        );
    }

    function handleToggleDislike() {
        setInteraction(
            interaction === PostInteraction.DISLIKE
                ? PostInteraction.NONE
                : PostInteraction.DISLIKE
        );
    }

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
            <div className="w-[80%] h-[80%] bg-white">
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
                        post
                    </h2>
                </div>
                <div className="px-5 pb-5 overflow-y-auto">
                    <p className="my-3"> {post.body} </p>
                    <div className="flex justify-between">
                        <div className="flex gap-3 justify-start">
                            <PropertyIcon
                                src={
                                    interaction === PostInteraction.LIKE
                                        ? "/icons/star-filled.svg"
                                        : "/icons/star.svg"
                                }
                                color={
                                    interaction === PostInteraction.LIKE
                                        ? "#ff0000"
                                        : undefined
                                }
                                value={post.likes}
                                onClick={handleToggleLike}
                            />
                            <PropertyIcon
                                src={
                                    interaction === PostInteraction.DISLIKE
                                        ? "/icons/dislike-filled.svg"
                                        : "/icons/dislike.svg"
                                }
                                color={
                                    interaction === PostInteraction.DISLIKE
                                        ? "#ff0000"
                                        : undefined
                                }
                                value={post.dislikes}
                                onClick={handleToggleDislike}
                            />
                            <PropertyIcon
                                src="/icons/eye.svg"
                                value={post.views}
                            />
                        </div>

                        <div className="flex justify-end">
                            <ExpiryIcon
                                expiry={post.expiry}
                                interaction={interaction}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type ExpiryIconProps = {
    expiry: number;
    interaction: PostInteraction;
};
function ExpiryIcon({ expiry, interaction }: ExpiryIconProps) {
    const [expiryDisplay, setExpiryDisplay] = useState("");

    useEffect(() => {
        setExpiryDisplay(toTimeDisplay(msTilDay(expiry)) + " left");
    }, []);

    const note =
        interaction === PostInteraction.LIKE
            ? " + 2d"
            : interaction === PostInteraction.DISLIKE
            ? " - 1d"
            : undefined;

    const color =
        interaction === PostInteraction.LIKE
            ? "#00ff00"
            : interaction === PostInteraction.DISLIKE
            ? "#ff0000"
            : undefined;

    return (
        <div className="relative">
            <PropertyIcon
                src="/icons/clock.svg"
                value={expiryDisplay}
                color={color}
            />
            {note && (
                <p className="absolute top-full left-1/2 -translate-x-1/2">
                    {note}
                </p>
            )}
        </div>
    );
}

type PropertyIconProps = {
    src: string;
    color?: string;
    value: number | string;
    onClick?: () => any;
};
function PropertyIcon({
    src,
    color = "var(--foreground)",
    value,
    onClick,
}: PropertyIconProps) {
    return (
        <div className="flex items-center gap-1" onClick={onClick}>
            <ColoredSvg src={src} width={20} height={20} color={color} />
            <p className={`text-[${color}]`}> {value} </p>
        </div>
    );
}
