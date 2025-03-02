"use client";

import { useEffect, useState, use } from "react";
import useSWR from "swr";

import { fetchPost, sendVoteRequest } from "@/lib/data";
import { Pos, Post, Vote } from "@/lib/types";

import NotFound from "@/app/not-found";
import ColoredSvg from "@/app/components/colored-svg";
import { usePostPos } from "../../contexts/post-pos-provider";
import Modal from "@/app/components/modal/modal";
import { useNotifications } from "@/app/contexts/notifications-provider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useJwt, useUsername } from "@/app/contexts/account-providers";


const ACTION_NAME: Readonly<Record<Vote, string>> = {
    [Vote.NONE]: "ignore",
    [Vote.LIKE]: "star",
    [Vote.DISLIKE]: "dislike",
};
const LIFETIME_WEIGHT: Readonly<Record<Vote, number>> = {
    [Vote.NONE]: 0,
    [Vote.LIKE]: 2,
    [Vote.DISLIKE]: -1,
};
const COLOR: Readonly<Record<Vote, string>> = {
    [Vote.NONE]: "var(--foreground)",
    [Vote.LIKE]: "#00ff00",
    [Vote.DISLIKE]: "#ff0000",
};

type UsePostType = {
    data?: {
        pos: Pos;
        vote?: Vote;
        post: Post;
    };
    error?: Error;
    isLoading: boolean;
};
function usePost(jwt: string | null, post_id: string): UsePostType {
    return useSWR(post_id, () => fetchPost(jwt, post_id) );
}

type Props = {
    params: Promise<{ id: string }>;
};
export default function Page({ params }: Props) {
    const jwt = useJwt();
    
    const username = useUsername()[0];

    const sendNotification = useNotifications();

    const post_id = use(params).id;
    const { data, error, isLoading } = usePost(jwt, post_id);

    const [_, updatePostPos] = usePostPos();

    const requestedVote = useSearchParams().get("set-vote") as Vote;
    const [vote, setVote] = useState(Vote.NONE);

    // if a vote was requested, act as if the user did that vote immediately
    useEffect(() => {
        if (requestedVote) handleVote(requestedVote);
    }, [requestedVote]);

    // update vote, expiry, map position once data comes in
    useEffect(() => {
        if (data) {
            updatePostPos(post_id, data.pos);
            setVote(data.vote ?? Vote.NONE);
        }
        return () => updatePostPos(null);
    }, [data]);

    //TODO: error page instead of not found page
    if (error) return <NotFound />;
    if (!data || isLoading) return <></>; //TODO: loading
    const { post } = data;

    function handleVote(nextVote: Vote) {

        if (nextVote == vote) return;

        if (jwt && username) {
            sendVoteRequest(jwt, post_id, nextVote);
            setVote(nextVote);
        } else {
            sendNotification(
                <p>
                    <Link href={`/sign-up?origin=/posts/${post_id}?set-vote=${nextVote}`} scroll={false}> create an account </Link>
                    or
                    <Link href={`/sign-in?origin=/posts/${post_id}?set-vote=${nextVote}`} scroll={false}> sign in </Link>
                    to {ACTION_NAME[nextVote]} this post.
                </p>
            );
        }
    }

    const { likes, dislikes } = data.post;

    // votes not counting the user's vote
    const priorVote = data.vote ?? Vote.NONE;
    const baseLikes = priorVote == Vote.LIKE ? likes - 1 : likes;
    const baseDislikes = priorVote == Vote.DISLIKE ? dislikes - 1 : dislikes;

    return (
        <Modal title="post">
            <div className="h-full m-5 mb-7 overflow-y-auto">
                <p className="my-3 select-all"> {post.author_name} </p>
                <p className="my-3 select-all"> {post.body} </p>

                {/* property icons row */}
                <div className="flex justify-between mt-6">
                    <div className="flex gap-3 justify-start">
                        <PropertyIcon 
                            src={vote === Vote.LIKE ? "/icons/star-filled.svg" : "/icons/star.svg"} 
                            color={vote === Vote.LIKE ? COLOR[Vote.LIKE] : undefined} 
                            value={vote == Vote.LIKE ? baseLikes + 1 : baseLikes} 
                            onClick={() => handleVote(vote === Vote.LIKE ? Vote.NONE : Vote.LIKE)} 
                        />
                        <PropertyIcon 
                            src={vote === Vote.DISLIKE ? "/icons/dislike-filled.svg" : "/icons/dislike.svg"} 
                            color={vote === Vote.DISLIKE ? COLOR[Vote.DISLIKE] : undefined} 
                            value={vote == Vote.DISLIKE ? baseDislikes + 1 : baseDislikes} 
                            onClick={() => handleVote(vote === Vote.DISLIKE ? Vote.NONE : Vote.DISLIKE)} 
                        />
                        <PropertyIcon src="/icons/eye.svg" value={post.views} />
                    </div>

                    <div className="flex justify-end">
                        <ExpiryIcon 
                            baseExpiry={data.post.expiry - LIFETIME_WEIGHT[priorVote]} 
                            vote={vote} 
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}

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
    const DAY_IN_MS = 1000 * 60 * 60 * 24;
    return typeof window === "undefined" ? 0 : day * DAY_IN_MS - Date.now();
}



type PropertyIconProps = {
    src: string;
    color?: string;
    value: number | string;
    onClick?: () => any;
};
function PropertyIcon({ src, color = "var(--foreground)", value, onClick }: PropertyIconProps) {
    return (
        <div 
            className={`flex items-center gap-1 ${onClick ? "cursor-pointer" : "cursor-default"}`} 
            onClick={onClick}
        >
            <ColoredSvg src={src} width={20} height={20} color={color} />
            <p> {value ?? "?"} </p>
        </div>
    );
}

type ExpiryIconProps = {
    baseExpiry?: number;
    vote: Vote;
};
function ExpiryIcon({ baseExpiry = 0, vote }: ExpiryIconProps) {

    const note = vote === Vote.LIKE ? "(+ 2d)" : vote === Vote.DISLIKE ? "(- 1d)" : undefined;

    return (
        <div className="relative">
            <PropertyIcon src="/icons/clock.svg" value={toTimeDisplay(msTilDay(baseExpiry + LIFETIME_WEIGHT[vote])) + " left"} />
            {note && (
                <p 
                    className="absolute bottom-full left-1/2 -translate-x-1/2" 
                    style={{ color: COLOR[vote] }}
                >
                    {note}
                </p>
            )}
        </div>
    );
}
