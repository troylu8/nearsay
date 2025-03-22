"use client";

import { addGap, Rect, rectsEqual, split, SplitRect, splitRectsEqual, alignToTiles, within, withinSplitRect } from "@/lib/area";
import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { Pos, User } from "@/lib/types";
import { EMOTICONS } from "@/lib/emoticon";
import useSWR from "swr";
import { socket, socketfetch } from "@/lib/server";
import TestDisplay from "./test-display";
import { useEffect, useState } from "react";
import { useChat } from "@/app/contexts/chat-provider";
import { useAvatar, useUsername } from "@/app/contexts/account-providers";
import { toArrayCoords, useGeolocation } from "@/app/contexts/geolocation-provider";

//TODO test edit-user, exit-world, enter-world

type UserPOI = {
    id: string,
    pos: Pos
    avatar: number,
    username: string
}
type Cluster = {
    id: string,
    pos: Pos,
    size: number,
    blurb?: string
}

type Markers = {
    posts: Cluster[];
    users: UserPOI[]
}

type UseMarkersType = {
    data?: Markers;
    error?: Error;
    isLoading: boolean;
}
function useMarkers(data: ViewShiftData): UseMarkersType {
    return useSWR(data, data => socketfetch<Markers>("view-shift", data));
}

type Props = {
    bounds: google.maps.LatLngBoundsLiteral;
}
export default function Markers({ bounds }: Props) {
    const router = useRouter();

    const splitView = split({top: bounds.north, bottom: bounds.south, left: bounds.west, right: bounds.east});
    addGap(splitView);
    let currData = toViewShiftData(splitView);
    const { data, error, isLoading } = useMarkers(currData);
    
    const [chatMsgs] = useChat();
    
    if (!data) return <TestDisplay view={splitView} viewShiftData={currData}  />;
    const { users, posts } = data;
    
    function handlePostClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }
    

    return (
        <>
            <TestDisplay key="test" view={splitView} viewShiftData={currData}  />
            <SelfMarker chatMsgs={chatMsgs["you"]} />
            {
                users
                .filter(u => withinSplitRect(splitView, u.pos[0], u.pos[1]))
                .map(u => <UserMarker key={u.id} user={u} chatMsgs={chatMsgs[u.id]} />)
            }
            {
                posts
                .filter(p => withinSplitRect(splitView, p.pos[0], p.pos[1]))    
                .map(cluster => 
                    <AdvancedMarker
                        key={cluster.id}
                        position={{lng: cluster.pos[0], lat: cluster.pos[1]}}
                    >
                        {
                            cluster.blurb? 
                                <div 
                                    className="post-marker" 
                                    onClick={() => handlePostClicked(cluster.id)}
                                >
                                    post
                                    <p> {cluster.blurb} </p>
                                </div> 
                                :
                                <div className="post-marker bg-red-400 after:border-t-red-400">
                                    {cluster.size}x
                                </div>
                        }
                    </AdvancedMarker>
                )
            }
        </>
    );
}

type SelfMarkerProps = {
    chatMsgs?: [string, string][],
}
function SelfMarker({chatMsgs}: SelfMarkerProps) {
    const { userPos } = useGeolocation();
    const [_, avatar] = useAvatar();
    return userPos && (
        <UserMarker 
            user={{id: "you", avatar, pos: toArrayCoords(userPos), username: "you"}}
            chatMsgs={chatMsgs}
            className="bg-red-400"
        />
    );
}

type UserMarkerProps = {
    user: UserPOI,
    chatMsgs?: [string, string][],
    className?: string
}
function UserMarker({ user, chatMsgs, className }: UserMarkerProps) {
    // return (
    //     <AdvancedMarker
    //         key={user.id}
    //         position={{lng: user.pos[0], lat: user.pos[1]}}
    //         zIndex={10}
    //     >
    //         <Pin/>
    //     </AdvancedMarker>
    // )
    return (
        <AdvancedMarker
            key={user.id}
            position={{lng: user.pos[0], lat: user.pos[1]}}
            zIndex={10}
        >
            <div className="flex flex-col items-center translate-y-3">
                {   chatMsgs && 
                    chatMsgs.map(([id, msg]) => {
                        return (
                            <p 
                                key={id} 
                                className="
                                    p-1 bg-slate-400 rounded-md mb-2 
                                    text-center w-fit max-w-[300px] break-words 
                                    text-white text-[16px] px-[7px] py-[4px]
                                "
                            >
                                {msg}  
                            </p>
                        )
                    })
                }
            </div>
            
            {/* wrap avatar in flexbox to center it */}
            <div className="flex flex-col"> 
                <div className={`avatar-frame translate-y-1/2 ${className} self-center`}>
                    {EMOTICONS[user.avatar]}
                    <p className="absolute top-full left-1/2 -translate-x-1/2" >{user.username}</p>
                </div>
            </div>
        </AdvancedMarker>
    )
}



export type ViewShiftData = {
    layer: number,
    view: SplitRect
};

function toViewShiftData(splitView: SplitRect): ViewShiftData {
    let {layer, view} = alignToTiles(splitView[0]!);

    return {
        layer,
        view: [view, splitView[1] && alignToTiles(splitView[1]).view]
    };
}