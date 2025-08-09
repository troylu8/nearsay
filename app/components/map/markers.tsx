"use client";

import { split, SplitRect,  withinSplitRect,  splitRectsEqual, getSplitTileRegion } from "@/lib/area";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { Pos } from "@/lib/types";
import { EMOTICONS } from "@/lib/emoticon";
import { socket, socketfetch } from "@/lib/server";
import TestDisplay from "./test-display";
import { useEffect,  useRef, useState, memo } from "react";
import { useChat } from "@/app/contexts/chat-provider";
import { useAvatar, usePresence, useUid } from "@/app/contexts/account-providers";
import { toArrayCoords, useGeolocation } from "@/app/contexts/geolocation-provider";
import { useNotifications } from "@/app/contexts/notifications-provider";
import ColoredSvg from "../colored-svg";
import { fetchOnlineUser } from "@/lib/data";

type UserPOI = {
    id: string,
    pos: Pos
    avatar: number,
    username?: string
}
type Cluster = {
    id: string,
    pos: Pos,
    size?: number,
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
        
        if (!prev || prev.uid != next.uid || prev.zoom != next.zoom || prev.tile_layer != next.tile_layer || !splitRectsEqual(prev.view, next.view)) {
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
    
    const [posts, setPosts] = useState<Cluster[]>([]);
    const [users, setUsers] = useState<UserPOI[]>([]);
    const updateViewShiftCache = useViewShiftDataCache();
    
    const splitView = split({top: bounds.north, bottom: bounds.south, left: bounds.west, right: bounds.east});
    // addGap(splitView);
    const [tile_layer, view] = getSplitTileRegion(splitView);
    const currViewData: ViewShiftData = { uid, zoom: zoomLevel, tile_layer, view };
    
    // keep track of the latest active request
    const markersReq = useRef<Promise<Markers> | null>(null);
    
    // if view data, check that aligned bounds changed then update markers 
    useEffect(() => {
        if (!updateViewShiftCache(currViewData)) return;
        
        let req = socketfetch<Markers>("view-shift", currViewData);
        markersReq.current = req;
        
        // console.log("req", currViewData);
        
        req.then(({posts, users}) => {
            // if a new request has been made before this one finishes, ignore the results
            if (markersReq.current != req) return; 
            
            // sort users and posts by id, so that receiving the same items in a different order won't trigger rerender
            posts.sort((a, b) => a.id < b.id? -1 : 1);
            users.sort((a, b) => a.id < b.id? -1 : 1);
            
            // console.log("recv", posts, users);
            
            setPosts(posts);
            setUsers(users);
            markersReq.current = null;
        })
        .catch(e => {
            sendNotification("server is down, map data unavailable");
            console.error(e);
        });
        
    }, [uid, zoomLevel, bounds])
    
    const [chatMsgs] = useChat();
    
    function handleUserEnter(newUser: UserPOI) {
        setUsers(prev => {
            const next = [...prev];
            insertUserOrPost(next, newUser);
            return next;
        });
    }
    function handleUserLeave(uid: string) {
        setUsers( prev => prev.filter(u => u.id != uid));
    }
    function handleUserUpdate(update: {id: string, avatar?: number, username?: string}) {
        setUsers( prev => {
            return prev.map(user => {
                if (user.id == update.id) {
                    const updatedUser = {...user};
                    if (update.avatar != null) updatedUser.avatar = update.avatar;
                    if (update.username != null) updatedUser.username = update.username;
                    return updatedUser;
                }
                else return user;
            })
        });
    }
    
    useEffect(() => {
        function handleNewPost(newPost: Cluster) {
            setPosts( prev => {
                insertUserOrPost(prev, newPost);
                return [...prev];
            });
        }
        function handlePostDelete(postId: string) {
            setPosts(prev => prev.filter(p => p.id != postId))
        }
        socket.on("user-enter", handleUserEnter);
        socket.on("user-leave", handleUserLeave);
        socket.on("user-update", handleUserUpdate);
        socket.on("new-post", handleNewPost);
        socket.on("post-delete", handlePostDelete);
        
        return () => { 
            socket.removeListener("user-enter", handleUserEnter); 
            socket.removeListener("user-leave", handleUserLeave); 
            socket.removeListener("user-update", handleUserUpdate);
            socket.removeListener("new-post", handleNewPost); 
            socket.removeListener("post-delete", handlePostDelete); 
        }
    }, []);
    
    useEffect(() => {
        function handleUserMove({id, pos}: {id: string, pos: Pos}) {
            
            const user = users.find(u => u.id == id);
                
            const USER_WAS_IN_BOUNDS = user != undefined;
            const NEW_POS_IN_BOUNDS = withinSplitRect(view, pos[0], pos[1]);
            
            // user moved around within bounds
            if (USER_WAS_IN_BOUNDS && NEW_POS_IN_BOUNDS) {
                setUsers(prev => {
                    return prev.map(user => (user.id == id)? {...user, pos: pos} : user);
                });
            }
            
            // user moved out of bounds
            else if (USER_WAS_IN_BOUNDS && !NEW_POS_IN_BOUNDS) {
                handleUserLeave(id);
            }
            
            // user moved into bounds
            else if (!USER_WAS_IN_BOUNDS && NEW_POS_IN_BOUNDS) {
                
                // temporarily add anonymous avatar
                handleUserEnter({id, pos, avatar: 0}); 
                
                // update with avatar and username after its available
                fetchOnlineUser(id).then(({avatar, username}) => {
                    handleUserUpdate({id, avatar, username});
                });
            }
        }
        socket.on("user-move", handleUserMove);
        return () => { socket.removeListener("user-move", handleUserMove); }
    }, [view, users]);
    
    return (
        <>
            {/* <TestDisplay key="test" view={splitView} viewShiftData={currViewData}  /> */}
            <SelfMarker key="you" chatMsgs={chatMsgs["you"]} />
            {
                users
                .filter(u => withinSplitRect(splitView, u.pos[0], u.pos[1]))
                .map(u => <UserMarker key={u.id} user={u} chatMsgs={chatMsgs[u.id]} />)
            }
            {
                posts
                .filter(p => withinSplitRect(splitView, p.pos[0], p.pos[1]))    
                .map(cluster => <ClusterMarker key={cluster.id} cluster={cluster} onClick={id => router.replace("/posts/" + id, { scroll: false })} />)
            }
        </>
    );
}

/** 
 * insert item into array such that the array is still sorted by id 
 * @param arr array of users or posts sorted by id
 * @param item new item to insert
 */
function insertUserOrPost<T extends UserPOI | Cluster>(arr: T[], item: T) {
    let lo = 0;
    let hi = arr.length-1;
    
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        
        if (arr[mid].id <= item.id) lo = mid + 1;
        else                        hi = mid - 1;
    }
    
    arr.splice(lo, 0, item);
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
            className={`bg-self-avatar [--outline-color:var(--color-self-avatar)] ${!present && "opacity-35"}`}
            zIndex={20}
        />
    );
}

type UserMarkerProps = {
    user: UserPOI,
    chatMsgs?: [string, string][],
    zIndex?: number,
    className?: string
}
const UserMarker = memo( ({ user, chatMsgs, zIndex = 10, className }: UserMarkerProps) => 
    <AdvancedMarker
        key={user.id}
        position={{lng: user.pos[0], lat: user.pos[1]}}
        zIndex={zIndex}
    >
        <div className="flex flex-col items-center translate-y-3">
            {   chatMsgs && 
                chatMsgs.map(([id, msg]) => {
                    return (
                        <p 
                            key={id} 
                            className="
                                p-1 bg-primary outline-2 outline-background rounded-md mb-2 
                                text-center w-fit max-w-[300px] break-words 
                                text-background text-[16px] px-[7px] py-[4px]
                                anim-fade-in
                            "
                            style={{fontFamily: "Cascadia, monospace"}}
                        >
                            {msg}  
                        </p>
                    )
                })
            }
        </div>
        
        {/* wrap avatar in flexbox to center it */}
        <div className="flex flex-col"> 
            <div className={`avatar-frame translate-y-1/2 [--outline-color:var(--color-others-avatar)] ${className} self-center`}>
                {EMOTICONS[user.avatar]}
                <p className="absolute top-full left-1/2 -translate-x-1/2 text-outline" style={{fontFamily: "Cascadia, monospace"}}>
                    {user.username}
                </p>
            </div>
        </div>
    </AdvancedMarker>
);

type ClusterMarkerProps = {
    cluster: Cluster,
    onClick: (id: string) => any
}
const ClusterMarker = memo( ({cluster, onClick}: ClusterMarkerProps) => {
    const mouseDownPosRef = useRef<[number, number] | null>(null);
    
    function handleMouseDown(x: number, y: number) {
        mouseDownPosRef.current = [x, y];
    }
    
    function handleMouseUp(upX: number, upY: number) {
        if (!mouseDownPosRef.current) return;
        /** 
         * max mouse drag distance in either axis between mousedown and mouseup
         * for it to count as clicking on the post instead of panning the map
         */
        const MAX_MOUSE_DELTA_PX = 5;
        
        const [downX, downY] = mouseDownPosRef.current;
        if (Math.abs(downX - upX) < MAX_MOUSE_DELTA_PX && Math.abs(downY - upY) < MAX_MOUSE_DELTA_PX) 
            onClick(cluster.id);
    }
    
    return (
        <AdvancedMarker
            key={cluster.id}
            position={{lng: cluster.pos[0], lat: cluster.pos[1]}}
        >
            {
                cluster.blurb? 
                    <div 
                        className="post-marker p-[6px] cursor-pointer" 
                        onTouchStart={e => {
                            handleMouseDown(e.targetTouches.item(0).clientX, e.targetTouches.item(0).clientY);
                        }}
                        onMouseDown={e => {
                            handleMouseDown(e.clientX, e.clientY)
                        }}
                        onTouchEnd={e => {
                            handleMouseUp(e.changedTouches.item(0).clientX, e.changedTouches.item(0).clientY)
                        }}
                        onMouseUp={e => {
                            handleMouseUp(e.clientX, e.clientY)
                        }}
                    >
                        <ColoredSvg 
                            src="/icons/message-dots.svg"
                            width={25} 
                            height={25} 
                            color="white"
                        />
                        <p className="[--outline-color:var(--color-post)] text-outline"> "{cluster.blurb}{cluster.blurb.length == 25 && "..." }" </p>
                    </div> 
                    :
                    <div className="post-marker bg-cluster after:border-t-cluster">
                        {cluster.size}x
                    </div>
            }
        </AdvancedMarker>
    );
});