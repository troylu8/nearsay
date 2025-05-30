"use client";

import { useEffect, useState, use, useRef, Fragment } from "react";
import useSWR from "swr";

import { fetchPost, sendVote } from "@/lib/data";
import { Vote } from "@/lib/types";

import NotFound from "@/app/not-found";
import ColoredSvg, { UIButton } from "@/app/components/colored-svg";
import { usePostPos } from "../../contexts/post-pos-provider";
import Modal from "@/app/components/modal/modal";
import { useNotifications } from "@/app/contexts/notifications-provider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useJWT, useUsername } from "@/app/contexts/account-providers";
import { EMOTICONS, randomEmoticon } from "@/lib/emoticon";
import { socketfetch } from "@/lib/server";
import ErrorModal from "@/app/components/modal/error-modal";


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
    [Vote.NONE]: "#000",
    [Vote.LIKE]: "var(--color-success)",
    [Vote.DISLIKE]: "var(--color-failure)",
};

export type Post = {
    authorAvatar?: number,
    authorName?: string,
    pos: [number, number],
    body: string;
    likes: number;
    dislikes: number;
    expiry: number;
    views: number;
};

type UsePostType = {
    data?: {
        vote?: Vote;
        post: Post;
    };
    error?: Error;
    isLoading: boolean;
};
function usePost(jwt: string | undefined, post_id: string): UsePostType {
    return useSWR(post_id, () => fetchPost(jwt, post_id));
}

type Props = {
    params: Promise<{ post_id: string }>;
};
export default function Page({ params }: Props) {
    
    const jwt = useJWT();
    
    const username = useUsername()[0];
    
    const sendNotification = useNotifications();
    
    const { post_id } = use(params);
    const { data, error, isLoading } = usePost(jwt, post_id);
    
    const [_, updatePostPos] = usePostPos();
    
    const requestedVote = useSearchParams().get("set-vote") as Vote;
    const [vote, setVote] = useState(Vote.NONE);
    const voteReqInProgressRef = useRef(false);
    
    const router = useRouter();
    const [clicksToDel, setClicksToDel] = useState(0);
    const resetClicksRef = useRef<NodeJS.Timeout | null>(null);
    
    // if a vote was requested, act as if the user did that vote immediately
    useEffect(() => {
        if (requestedVote) handleVote(requestedVote);
    }, [requestedVote]);

    // update vote, expiry, map position once data comes in
    useEffect(() => {
        if (data) {
            updatePostPos(post_id, data.post.pos);
            setVote(data.vote ?? Vote.NONE);
        }
        return () => updatePostPos(null);
    }, [data]);
    
     
    if (error) return error.message == "404"? <NotFound/> : (
        <ErrorModal 
            title="post" 
            msg={`sorry, we had trouble getting post "${post_id}":`}
            err={error}
        />
    );
    if (!data || isLoading) return <Modal title="post"> please wait... </Modal>;
    const { post } = data;
    
    async function handleVote(nextVote: Vote) {

        if (nextVote == vote) return;
        
        if (!jwt || !username) {
            sendNotification(
                <p>
                    <Link 
                        href={`/sign-in?origin=/posts/${post_id}?set-vote=${nextVote}`} 
                        scroll={false}
                        className="text-background"
                    > 
                        sign in 
                    </Link>
                    &nbsp; to {ACTION_NAME[nextVote]} this post.
                </p>
            );
            return;
        }
        
        if (voteReqInProgressRef.current) return;
            
        voteReqInProgressRef.current = true;
        
        const resp = await sendVote(jwt, post_id, nextVote)
        
        if (resp.ok)    setVote(nextVote);
        else            sendNotification("server error");
        
        voteReqInProgressRef.current = false;
    }
    
    
    async function handleDeletePost() {
        if (clicksToDel == 4) {
            await socketfetch("delete-post", {jwt, post_id});
            router.replace("/", {scroll: false});
            sendNotification("post deleted");
        }
        else {
            setClicksToDel(x => x + 1);
            
            if (resetClicksRef.current) 
                clearTimeout(resetClicksRef.current);
            
            resetClicksRef.current = setTimeout(() => {
                setClicksToDel(0);
                resetClicksRef.current = null;
            }, 3000);
        }
        
    }

    const { likes, dislikes } = data.post;

    // votes not counting the user's vote
    const priorVote = data.vote ?? Vote.NONE;
    const baseLikes = priorVote == Vote.LIKE ? likes - 1 : likes;
    const baseDislikes = priorVote == Vote.DISLIKE ? dislikes - 1 : dislikes;
    
    const [avatarColor, usernameColor] = 
        post.authorAvatar == undefined ? ["bg-secondary", "text-secondary"] :
        post.authorName == username?  ["bg-self-avatar", "text-self-avatar"] :
        ["bg-others-avatar", "text-others-avatar"];
    
    return (
        <Modal title="post">
            <div className="mx-5">
                <div className="flex items-center gap-3">
                    <div className={`avatar-frame ${avatarColor}`}> 
                        {post.authorAvatar? EMOTICONS[post.authorAvatar] : randomEmoticon(post_id)} 
                    </div>
                    <p className={`my-3 select-text ${usernameColor}`}> {post.authorName ?? "[anonymous]"} </p>
                    
                    {username != null && post.authorName === username &&
                        <div className="grow flex flex-row-reverse gap-3 items-center">
                            <UIButton
                                src="/icons/trash.svg"
                                iconSize={16}
                                onClick={handleDeletePost}
                                className="justify-self-end p-1! bg-failure!"
                            />
                            { resetClicksRef.current != null &&
                                <p className="text-failure text-sm text-right"> 
                                    {clicksToDel}/5
                                </p>
                            }
                        </div>
                    }
                </div>
                <p className="my-3 select-text">
                    {
                        post.body.split("\n").map((line, i) => <Fragment key={i}>{line}<br/></Fragment>)
                    }
                </p>

                {/* property icons row */}
                <div className="flex justify-between py-6">
                    <div className="flex gap-3 justify-start">
                        <PropertyIcon 
                            src={vote === Vote.LIKE ? "/icons/star-filled.svg" : "/icons/star.svg"} 
                            color={COLOR[Vote.LIKE]} 
                            value={vote == Vote.LIKE ? baseLikes + 1 : baseLikes} 
                            onClick={() => handleVote(vote === Vote.LIKE ? Vote.NONE : Vote.LIKE)} 
                        />
                        <PropertyIcon 
                            src={vote === Vote.DISLIKE ? "/icons/dislike-filled.svg" : "/icons/dislike.svg"} 
                            color={COLOR[Vote.DISLIKE]} 
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
function PropertyIcon({ src, color = "#000", value, onClick }: PropertyIconProps) {
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
    
    const MS_UNTIL_EXPIRY = msTilDay(baseExpiry + LIFETIME_WEIGHT[vote]);
    const TIME_DISPLAY = MS_UNTIL_EXPIRY > 0? `${toTimeDisplay(MS_UNTIL_EXPIRY)} left` : "til 0:00 UTC" 
    
    return (
        <div className="relative">
            <PropertyIcon src="/icons/clock.svg" value={TIME_DISPLAY} />
            {note && (
                <p 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 text-nowrap" 
                    style={{ color: COLOR[vote] }}
                >
                    {note}
                </p>
            )}
        </div>
    );
}
