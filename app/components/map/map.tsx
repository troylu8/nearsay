"use client";

import {
    APIProvider,
    Map as GoogleMap,
    MapCameraChangedEvent,
    useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { sendViewShiftEvent } from "@/lib/data";

import {
    split,
    SplitRect,
    SplitTileRegion,
    toSplitTileRegion,
    splitTileRegionsEqual,
    isSplit,
    Rect,
} from "@/lib/area";
import TestDisplay from "./test-display";
import { usePostPos } from "../../contexts/post-pos-context-provider";
import { useGeolocation } from "../../contexts/geolocation-context-provider";
import Markers from "./markers/markers";
import MapUI from "./map-ui";

export default function Map() {
    const [view, setView] = useState<SplitRect>([undefined, undefined]);

    const tileRegion = useRef<SplitTileRegion>([undefined, undefined]);

    const { userPos } = useGeolocation();

    function handleCameraChanged(e: MapCameraChangedEvent) {
        const {
            north: top,
            south: bottom,
            west: left,
            east: right,
        } = e.detail.bounds;

        let view = split({ top, bottom, left, right });

        addGap(view); //TODO: remove

        const nextTileRegions = toSplitTileRegion(view);

        // if tile region hasnt changed, then set view now.
        if (splitTileRegionsEqual(nextTileRegions, tileRegion.current))
            return setView(view);

        // if tile region changed, the set view (to reload markers)
        // after poi tree is populated with request data
        sendViewShiftEvent(nextTileRegions, tileRegion.current).then(
            () => setView(view) // after a successful move request, load markers
        );

        tileRegion.current = nextTileRegions;
    }

    return (
        <div className="fixed w-full h-full">
            <APIProvider
                apiKey="AIzaSyCgfo_mjq90b6syVuWL2QbJbKwAqll9ceE"
                libraries={["geometry"]}
            >
                <GoogleMap
                    mapId="4cd1599c3ca39378"
                    defaultZoom={7} //TODO: should be 17
                    defaultCenter={userPos}
                    disableDefaultUI
                    keyboardShortcuts={false}
                    onCameraChanged={handleCameraChanged}
                >
                    <Markers view={view} />
                    <TestDisplay view={view} />
                    <MapUI />
                </GoogleMap>

                <PanToActivePost />
            </APIProvider>
        </div>
    );
}

function PanToActivePost() {
    const map = useMap(); // the map component itself cannot use useMap()

    const [postPos, __] = usePostPos();

    useEffect(() => {
        if (postPos) {
            const postPosLatLng: google.maps.LatLngLiteral = {
                lng: postPos![0],
                lat: postPos![1],
            };
            if (!map?.getBounds()?.contains(postPosLatLng)) {
                map?.panTo(postPosLatLng);
            }
        }
    }, [map, postPos]);

    return <></>;
}

function addGap(view: SplitRect) {
    let gapW;
    let gapH;
    if (isSplit(view)) {
        const [a, b] = view as [Rect, Rect];
        gapW = (a.right - a.left + (b.right - b.left)) * 0.3;
        gapH = (a.top - a.bottom) * 0.3;

        if (a.right - a.left < gapW) {
            view[0] = undefined;
            b.top -= gapH;
            b.bottom += gapH;

            if (a.left == -180) {
                b.right = 180 - (gapW - (a.right - a.left));
                b.left += gapW;
            } else {
                b.left = -180 + (gapW - (a.right - a.left));
                b.right -= gapW;
            }
        } else if (b.right - b.left < gapW) {
            view[1] = undefined;
            a.top -= gapH;
            a.bottom += gapH;

            if (b.left == -180) {
                a.right = 180 - (gapW - (b.right - b.left));
                a.left += gapW;
            } else {
                a.left = -180 + (gapW - (b.right - b.left));
                a.right -= gapW;
            }
        } else {
            a.top -= gapH;
            b.top -= gapH;
            a.bottom += gapH;
            b.bottom += gapH;
            if (a.left == -180) a.right -= gapW;
            if (a.right == 180) a.left += gapW;
            if (b.left == -180) b.right -= gapW;
            if (b.right == 180) b.left += gapW;
        }
    } else {
        gapW = (view[0]!.right - view[0]!.left) * 0.3;
        gapH = (view[0]!.top - view[0]!.bottom) * 0.3;
        view[0]!.top -= gapH;
        view[0]!.bottom += gapH;
        view[0]!.left += gapW;
        view[0]!.right -= gapW;
    }
}
