"use client";

import { pxToDegrees, SplitRect } from "@/lib/area";
import { pois } from "@/lib/data";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { cluster, isCluster, Cluster } from "@/lib/cluster";
import { POI, PostPOIExt, UserPOIExt } from "@/lib/types";
import { useEffect, useReducer } from "react";
import { EMOTICONS } from "@/lib/emoticon";

type Props = {
    view?: SplitRect;
};

export default function Markers({ view }: Props) {
    const map = useMap()!;
    const router = useRouter();

    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        pois.addPoisChangedHandler(forceUpdate);
        return () => pois.removePoisChangedHandler(forceUpdate);
    }, []);

    if (!view) return <></>;

    function handleMarkerClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }


    const markers = view
        .map((v) => {
            if (!v) return [];
            const visiblePOIs = pois.search(v);

            

            return [
                ...visiblePOIs.filter(poi => poi.kind === "user"),
                ...cluster(visiblePOIs.filter(poi => poi.kind === "post"), pxToDegrees(map, 50))
            ]
        })
        .flat();
    
    return markers.map((item: POI | Cluster, i) => {
        if (isCluster(item)) {
            const cluster = item as Cluster;
            return (
                <AdvancedMarker
                    key={i}
                    position={{lng: cluster.pos[0], lat: cluster.pos[1]}}
                >
                    <div className="post-marker bg-red-400 after:border-t-red-400">
                        {cluster.size}x
                    </div>
                </AdvancedMarker>
            );
        } else {
            const poi = item as POI & (PostPOIExt | UserPOIExt);
            
            const icon = poi.kind === "post"? "post" : EMOTICONS[(poi as UserPOIExt).avatar];
            const label = poi.kind === "post"? (poi as PostPOIExt).blurb : (poi as UserPOIExt).username;
            
            return (
                <AdvancedMarker
                    key={i}
                    position={{lng: poi.pos[0], lat: poi.pos[1]}}
                    onClick={() => handleMarkerClicked(poi._id)}
                >
                    <div className={poi.kind === "post"? "post-marker" : "avatar translate-y-1/2"}>
                        {icon}
                        <p>{label}</p>
                    </div>
                </AdvancedMarker>
            );
        }
    });
}