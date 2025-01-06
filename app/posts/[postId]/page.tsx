import ColoredSvg from "@/app/components/colored-svg";
import Link from "next/link";

import { POI } from "@/lib/post";

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
    return day * DAY_IN_MS - Date.now();
}

type Props = {
    params: Promise<{ postId: string }>;
};
export default async function Post({ params }: Props) {
    const { postId } = await params;

    const post: POI = {
        _id: "a",
        pos: [0, 0],
        variant: "post",
        timestamp: 0,
        data: {
            body: "lorem adjk",
            likes: 10,
            dislikes: 20,
            expiry: 21000,
            views: 40,
        },
    };

    return (
        <div className="fixed w-full h-full flex flex-col">
            <div className="p-3 flex justify-start relative">
                <Link href="/" scroll={false}>
                    <ColoredSvg
                        src={"/icons/back.svg"}
                        width={25}
                        height={25}
                        color="black"
                    />
                </Link>

                <h2 className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                    post
                </h2>
            </div>
            <div className="px-5 pb-5 overflow-y-auto">
                <p className="my-3"> {post.data?.body} </p>
                <div className="flex gap-3 justify-around">
                    <PropertyIcon
                        src="/icons/star.svg"
                        value={post.data!.likes}
                    />
                    <PropertyIcon
                        src="/icons/heart-crossed.svg"
                        value={post.data!.dislikes}
                    />
                    <PropertyIcon
                        src="/icons/clock.svg"
                        value={toTimeDisplay(msTilDay(post.data!.expiry))}
                    />
                    <PropertyIcon
                        src="/icons/eye.svg"
                        value={post.data!.views}
                    />
                </div>
            </div>
        </div>
    );
}

type PropertyIconProps = {
    src: string;
    value: number | string;
    onClick?: () => any;
};
function PropertyIcon({ src, value, onClick }: PropertyIconProps) {
    return (
        <div className="flex items-center gap-1" onClick={onClick}>
            <ColoredSvg src={src} width={20} height={20} color="black" />
            <p> {value} </p>
        </div>
    );
}
