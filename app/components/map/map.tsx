"use client";

import {
    APIProvider,
    Map as GoogleMap,
    MapCameraChangedEvent,
    MapProps,
    useMap,
} from "@vis.gl/react-google-maps";
import { FunctionComponent, useRef, useState } from "react";
import { sendMoveRequest } from "@/lib/post";

import {
    getTileRegion,
    isEqual,
    pxToDegrees,
    Rect,
    TileRegion,
} from "@/lib/area";
import { Polygon } from "./polygon";
import Markers from "./markers";
import TestDisplay from "./TestDisplay";

export type SplitRect = [Rect?, Rect?];
export type SplitTileRegion = [TileRegion?, TileRegion?];

function toSplitTileRegion(splitRect: SplitRect): SplitTileRegion {
    return [
        splitRect[0] && getTileRegion(splitRect[0]),
        splitRect[1] && getTileRegion(splitRect[1]),
    ];
}
function toSplitRect(splitTileRegion: SplitTileRegion): SplitRect {
    return [
        splitTileRegion[0] && splitTileRegion[0].area,
        splitTileRegion[1] && splitTileRegion[1].area,
    ];
}

export function isSplit(rect: SplitRect) {
    return rect[1] != undefined;
}
function split(rect: Rect): SplitRect {
    return rect.right < rect.left
        ? [
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: 180,
              },
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: -180,
                  right: rect.right,
              },
          ]
        : [rect, undefined];
}

function applyGap(rect: Rect, gap: number) {
    rect.top -= gap;
    rect.bottom += gap;
    rect.left += gap;
    rect.right -= gap;
}

export default function Map() {
    const [view, setView] = useState<SplitRect>([undefined, undefined]);

    const [tileRegion, setTileRegion] = useState<SplitTileRegion>([
        undefined,
        undefined,
    ]);

    function handleCameraChanged(e: MapCameraChangedEvent) {
        const {
            north: top,
            south: bottom,
            west: left,
            east: right,
        } = e.detail.bounds;

        let view = split({ top, bottom, left, right });
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

        setView(view);
        const nextTileRegions = toSplitTileRegion(view);

        if (
            isEqual(nextTileRegions[0], tileRegion[0]) &&
            isEqual(nextTileRegions[1], tileRegion[1])
        )
            return;
        setTileRegion(nextTileRegions);

        sendMoveRequest(nextTileRegions, tileRegion);
    }

    return (
        <div className="fixed w-full h-full">
            <APIProvider apiKey="AIzaSyCgfo_mjq90b6syVuWL2QbJbKwAqll9ceE">
                <GoogleMap
                    mapId="4cd1599c3ca39378"
                    defaultZoom={6}
                    defaultCenter={{ lat: 0, lng: 0 }}
                    disableDefaultUI
                    keyboardShortcuts={false}
                    onCameraChanged={handleCameraChanged}
                >
                    <Markers view={view} />
                    <TestDisplay
                        view={view}
                        tileRegionAreas={toSplitRect(tileRegion)}
                    />
                </GoogleMap>
            </APIProvider>
        </div>
    );
}
