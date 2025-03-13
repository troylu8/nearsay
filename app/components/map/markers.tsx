"use client";

import { addGap, Rect, rectsEqual, split, SplitRect, splitRectsEqual, toTileRegion } from "@/lib/area";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { useEffect, useReducer, useRef } from "react";
import { EMOTICONS } from "@/lib/emoticon";
import useSWR from "swr";
import { emitAsync } from "@/lib/server";
import TestDisplay from "./test-display";

type Cluster = {
    id?: string,
    pos: [number, number],
    size: number,
    blurb?: string
}

type Markers = {
    posts: Cluster[];
    users: User[]
}

type UseMarkersType = {
    data?: Markers;
    error?: Error;
    isLoading: boolean;
}
function useMarkers(data: ViewShiftData | null, prevMarkers: Markers): UseMarkersType {
    return useSWR("view-shift", async () => 
        data?
            await emitAsync<Markers>("view-shift", data) :
            prevMarkers
    );
}

type Props = {
    bounds: google.maps.LatLngBoundsLiteral;
}
export default function Markers({ bounds }: Props) {
    const router = useRouter();

    const prevMarkers = useRef<Markers>({posts: [], users: []});
    const prevViewShiftData = useRef<ViewShiftData | null>(null);

    const { north: top, south: bottom, west: left, east: right } = bounds;
    const splitView = split({top, bottom, left, right});
    addGap(splitView); //TODO: remove
    let currData: ViewShiftData | null = toViewShiftData(splitView);

    // if curr data is same as prev data, don't send req
    if (
        prevViewShiftData.current != null &&
        viewShiftDataEqual(prevViewShiftData.current, currData)
    )   
        currData = null;
    else 
        prevViewShiftData.current = currData;

    const { data: fetchedMarkers, error, isLoading } = useMarkers(currData, prevMarkers.current);

    if (!fetchedMarkers) return <></>;
    prevMarkers.current = fetchedMarkers;
    const { users, posts } = fetchedMarkers;

    function handlePostClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }

    return (
        <>
            <TestDisplay view={splitView} viewShiftData={prevViewShiftData.current}  />
            {
                users.map(user => 
                    <AdvancedMarker
                        key={user._id}
                        position={{lng: user.pos![1], lat: user.pos![0]}}
                    >
                        <div className="avatar translate-y-1/2">
                            {EMOTICONS[user.avatar]}
                            <p>{user.username}</p>
                        </div>
                    </AdvancedMarker>
                )
            }
            {
                posts.map((cluster, i) => 
                    <AdvancedMarker
                        key={i}
                        position={{lng: cluster.pos[1], lat: cluster.pos[0]}}
                    >
                        {
                            cluster.blurb? 
                                <div 
                                    className="post-marker" 
                                    onClick={() => handlePostClicked(cluster.id!)}
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

export type ViewShiftData = {
    depth: number,
    area: SplitRect
};

function viewShiftDataEqual(a: ViewShiftData, b: ViewShiftData) {
    return a.depth == b.depth && splitRectsEqual(a.area, b.area);
}

function toViewShiftData(splitView: SplitRect): ViewShiftData {
    let {depth, area} = toTileRegion(splitView[0]!); //TODO: remove !

    return {
        depth,
        area: [area, splitView[1] && toTileRegion(splitView[1]).area]
    };
}