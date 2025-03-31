"use client";

import { addGap, Rect, split, SplitRect, within, withinSplitRect, BOUND, splitRectsEqual, getSplitTileRegion } from "@/lib/area";
import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { Pos, User } from "@/lib/types";
import { EMOTICONS } from "@/lib/emoticon";
import { socket, socketfetch } from "@/lib/server";
import TestDisplay from "./test-display";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/app/contexts/chat-provider";
import { useAvatar, usePresence, useUid, useUsername } from "@/app/contexts/account-providers";
import { toArrayCoords, useGeolocation } from "@/app/contexts/geolocation-provider";
import { useNotifications } from "@/app/contexts/notifications-provider";

//TODO test edit-user, exit-world, enter-world

type UserPOI = {
    id: string,
    pos: Pos
    avatar: number,
    username?: string
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

/** update the cached view shift data and return whether the cached data was changed */
type UpdateViewShiftCache = (next: ViewShiftData) => boolean;

function useViewShiftDataCache(): UpdateViewShiftCache {
    const prevRef = useRef<ViewShiftData | null>(null);
    
    return (next: ViewShiftData) => {
        const prev = prevRef.current;
        
        if (!prev || prev.zoom != next.zoom || prev.tile_layer != next.tile_layer || !splitRectsEqual(prev.view, next.view)) {
            prevRef.current = next;
            return true;
        }
        
        return false;
    };
}

export type ViewShiftData = {
    uid?: string,
    zoom: number,
    tile_layer: number,
    view: SplitRect
};

type Props = {
    zoomLevel: number,
    bounds: google.maps.LatLngBoundsLiteral;
}
export default function Markers({ zoomLevel, bounds }: Props) {
    const router = useRouter();
    const uid = useUid();
    const sendNotification = useNotifications();
    
    const [markers, setMarkers] = useState<Markers>({ posts: [], users: []});
    const updateViewShiftCache = useViewShiftDataCache();
    
    const splitView = split({top: bounds.north, bottom: bounds.south, left: bounds.west, right: bounds.east});
    addGap(splitView);
    const [tile_layer, view] = getSplitTileRegion(splitView);
    const currData: ViewShiftData = { uid, zoom: zoomLevel, tile_layer, view };
    
    // keep track of the latest active request
    const markersReq = useRef<Promise<Markers> | null>(null);
    
    // if zoom or bounds change, check that aligned bounds changed then update markers 
    useEffect(() => {
        
        if (updateViewShiftCache(currData)) {
            let req = socketfetch<Markers>("view-shift", currData);
            markersReq.current = req;
            
            req.then(markers => {
                // if a new request has been made before this one finishes, ignore the results
                if (markersReq.current == req) {    
                    setMarkers(markers);
                    markersReq.current = null;
                }
            })
            .catch(e => {
                sendNotification("error getting map data from server");
                console.error(e);
            });
        }
    }, [uid, zoomLevel, bounds])
    
    
    const [chatMsgs] = useChat();
    
    useEffect(() => {
        function handleUserEnter(newUser: UserPOI) {
            setMarkers( prev => ({posts: prev.posts, users: [...prev.users, newUser]}) );
        }
        socket.on("user-enter", handleUserEnter);
        
        return () => { socket.removeListener("user-enter", handleUserEnter); }
    }, []);
    
    
    function handlePostClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }

    return (
        <>
            <TestDisplay key="test" view={splitView} viewShiftData={currData}  />
            <SelfMarker chatMsgs={chatMsgs["you"]} />
            {
                markers.users
                .filter(u => withinSplitRect(splitView, u.pos[0], u.pos[1]))
                .map(u => <UserMarker key={u.id} user={u} chatMsgs={chatMsgs[u.id]} />)
            }
            {
                markers.posts
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
    const [present] = usePresence();
    const [userPos] = useGeolocation();
    const [_, avatar] = useAvatar();
    return userPos && (
        <UserMarker 
            user={{id: "you", avatar, pos: toArrayCoords(userPos), username: "you"}}
            chatMsgs={chatMsgs}
            className={`bg-red-400 ${!present && "opacity-35"}`}
        />
    );
}

type UserMarkerProps = {
    user: UserPOI,
    chatMsgs?: [string, string][],
    className?: string
}
function UserMarker({ user, chatMsgs, className }: UserMarkerProps) {
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
                                    anim-fade-in
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


