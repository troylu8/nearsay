"use client";

import { pxToDegrees, SplitRect } from "@/lib/area";
import { pois } from "@/lib/data";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import "./markers.css";
import { cluster, isCluster, Cluster } from "@/lib/cluster";
import { POI } from "@/lib/data";
import { useEffect, useState } from "react";

type Props = {
    view?: SplitRect;
};

export default function Markers({ view }: Props) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        function rerenderMarkers() {
            setKey(key + 1);
        }
        pois.addPoisChangedHandler(rerenderMarkers);
        return () => pois.removePoisChangedHandler(rerenderMarkers);
    });

    return <MarkersInner key={key} view={view} />;
}

function MarkersInner({ view }: Props) {
    const map = useMap()!;
    const router = useRouter();

    if (!view) return <></>;

    function handleMarkerClicked(id: string) {
        router.replace("/posts/" + id, { scroll: false });
    }

    const markers = view
        .map((v) => {
            if (!v) return [];
            return cluster(pois.search(v), pxToDegrees(map, 50));
        })
        .flat();

    return markers.map((item: POI | Cluster, i) => {
        if (isCluster(item)) {
            const cluster = item as Cluster;
            return (
                <AdvancedMarker
                    key={i}
                    position={{
                        lng: cluster.pos[0],
                        lat: cluster.pos[1],
                    }}
                >
                    <div className="post-marker bg-red-400 after:border-t-red-400">
                        {cluster.size}x
                    </div>
                </AdvancedMarker>
            );
        } else {
            const poi = item as POI;
            return (
                <AdvancedMarker
                    key={i}
                    position={{
                        lng: poi.pos[0],
                        lat: poi.pos[1],
                    }}
                    onClick={() => handleMarkerClicked(poi._id)}
                >
                    <div className="post-marker">{poi.variant}</div>
                </AdvancedMarker>
            );
        }
    });
}
