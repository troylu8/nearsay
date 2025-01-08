"use client";

import { pxToDegrees, Rect } from "@/lib/area";
import { poisTree, POI } from "@/lib/post";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import "./marker.css";
import { cluster, isCluster, Cluster } from "@/lib/cluster";

type Props = {
    view?: Rect;
};
export default function Markers({ view }: Props) {
    const map = useMap()!;
    const router = useRouter();

    if (!view) return <></>;

    function handleMarkerClicked() {
        router.replace("/posts/asd", { scroll: true });
    }

    return cluster(poisTree.search(view), pxToDegrees(map, 30), view).map(
        (item: POI | Cluster, i) => {
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
                    >
                        <div className="post-marker">{poi.variant}</div>
                    </AdvancedMarker>
                );
            }
        }
    );
}
