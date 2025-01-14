"use client";

import {
    APIProvider,
    Map as GoogleMap,
    MapCameraChangedEvent,
    useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { sendMoveRequest } from "@/lib/data";

import {
    split,
    SplitRect,
    SplitTileRegion,
    toSplitRect,
    toSplitTileRegion,
    splitTileRegionsEqual,
} from "@/lib/area";
import TestDisplay from "./test-display";
import { usePostPos } from "../post/post-pos-context-provider";
import { useGeolocation } from "../geolocation-context-provider";
import Markers from "./markers/markers";
import YouAreHereMarker from "./markers/you-are-here-marker";

export default function Map() {
    const [view, setView] = useState<SplitRect>([undefined, undefined]);

    const [tileRegion, setTileRegion] = useState<SplitTileRegion>([
        undefined,
        undefined,
    ]);

    const geolocation = useGeolocation();
    const [following, setFollowing] = useState(true);
    const [center, setCenter] = useState<google.maps.LatLngLiteral>({
        lat: 0,
        lng: 0,
    });

    function handleCameraChanged(e: MapCameraChangedEvent) {
        const {
            north: top,
            south: bottom,
            west: left,
            east: right,
        } = e.detail.bounds;

        let view = split({ top, bottom, left, right });

        setView(view);
        const nextTileRegions = toSplitTileRegion(view);

        if (splitTileRegionsEqual(nextTileRegions, tileRegion)) return;
        setTileRegion(nextTileRegions);

        sendMoveRequest(nextTileRegions, tileRegion);
    }

    function handleDrag() {
        setFollowing(false);
    }

    useEffect(() => {
        if (geolocation.pos) setCenter(geolocation.pos);
    }, [geolocation]);

    return (
        <div className="fixed w-full h-full">
            <APIProvider apiKey="AIzaSyCgfo_mjq90b6syVuWL2QbJbKwAqll9ceE">
                <GoogleMap
                    mapId="4cd1599c3ca39378"
                    defaultZoom={17}
                    defaultCenter={{ lng: 139.6917, lat: 35.6895 }}
                    disableDefaultUI
                    center={following ? center : undefined}
                    keyboardShortcuts={false}
                    onCameraChanged={handleCameraChanged}
                    onDrag={handleDrag}
                >
                    <YouAreHereMarker pos={center!} />
                    <Markers view={view} />
                    <TestDisplay
                        view={view}
                        tileRegionAreas={toSplitRect(tileRegion)}
                    />
                </GoogleMap>
                <PanMapToPost setFollowing={setFollowing} />
            </APIProvider>
        </div>
    );
}

type PanMapProps = {
    setFollowing: (newFollowing: boolean) => any;
};
function PanMapToPost({ setFollowing }: PanMapProps) {
    const map = useMap(); // the map component itself cannot use useMap()

    const [postPos, _] = usePostPos();

    useEffect(() => {
        if (postPos) {
            const postPosLatLng: google.maps.LatLngLiteral = {
                lng: postPos![0],
                lat: postPos![1],
            };
            if (!map?.getBounds()?.contains(postPosLatLng)) {
                map?.setCenter(postPosLatLng);
                setFollowing(false);
            }
        }
    }, [map, postPos]);

    return <></>;
}

// let gapW;
// let gapH;
// if (isSplit(view)) {
//     const [a, b] = view as [Rect, Rect];
//     gapW = (a.right - a.left + (b.right - b.left)) * 0.3;
//     gapH = (a.top - a.bottom) * 0.3;

//     if (a.right - a.left < gapW) {
//         view[0] = undefined;
//         b.top -= gapH;
//         b.bottom += gapH;

//         if (a.left == -180) {
//             b.right = 180 - (gapW - (a.right - a.left));
//             b.left += gapW;
//         } else {
//             b.left = -180 + (gapW - (a.right - a.left));
//             b.right -= gapW;
//         }
//     } else if (b.right - b.left < gapW) {
//         view[1] = undefined;
//         a.top -= gapH;
//         a.bottom += gapH;

//         if (b.left == -180) {
//             a.right = 180 - (gapW - (b.right - b.left));
//             a.left += gapW;
//         } else {
//             a.left = -180 + (gapW - (b.right - b.left));
//             a.right -= gapW;
//         }
//     } else {
//         a.top -= gapH;
//         b.top -= gapH;
//         a.bottom += gapH;
//         b.bottom += gapH;
//         if (a.left == -180) a.right -= gapW;
//         if (a.right == 180) a.left += gapW;
//         if (b.left == -180) b.right -= gapW;
//         if (b.right == 180) b.left += gapW;
//     }
// } else {
//     gapW = (view[0]!.right - view[0]!.left) * 0.3;
//     gapH = (view[0]!.top - view[0]!.bottom) * 0.3;
//     view[0]!.top -= gapH;
//     view[0]!.bottom += gapH;
//     view[0]!.left += gapW;
//     view[0]!.right -= gapW;
// }
