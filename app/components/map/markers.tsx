"use client";

import { Rect } from "@/lib/area";
import { poisTree, POI } from "@/lib/post";
import { Marker, MarkerClusterer } from "@googlemaps/markerclusterer";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./marker.css";

type Props = {
    view?: Rect;
};
export default function Markers({ view }: Props) {
    const map = useMap()!;

    function pxToDegrees(px: number) {
        const mapWidthDegrees =
            map.getBounds()!.getNorthEast().lng() -
            map.getBounds()!.getSouthWest().lng();

        return (px * mapWidthDegrees) / map.getDiv().clientWidth;
    }

    const router = useRouter();

    function handleMarkerClicked() {
        router.replace("/posts/asd", { scroll: true });
    }

    if (!view) return <></>;

    const [pois, clusters] = poisTree.search(view, 1 / pxToDegrees(50));
    console.log(pois, clusters);

    const res = [
        ...pois.map((poi) => (
            <AdvancedMarker
                key={poi._id}
                position={{ lng: poi.pos[0], lat: poi.pos[1] }}
                onClick={handleMarkerClicked}
            >
                <div className="post-marker">{poi.variant}</div>
            </AdvancedMarker>
        )),
        ...clusters.map((cluster) => {
            const { left, right, top, bottom } = cluster.bound;

            return (
                <AdvancedMarker
                    key={`${left},${right},${top},${bottom}`}
                    position={{
                        lng: (left + right) / 2,
                        lat: (top + bottom) / 2,
                    }}
                >
                    <div className="post-marker bg-red-400 after:border-t-red-400">
                        {cluster.size}x
                    </div>
                </AdvancedMarker>
            );
        }),
    ];

    return res;
}
