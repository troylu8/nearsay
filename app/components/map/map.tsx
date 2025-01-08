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

export function isSplit(rect: Rect | [Rect, Rect]) {
    return (rect as any).length == 2;
}
function trySplit(rect: Rect): Rect | [Rect, Rect] {
    return rect.right < rect.left
        ? [
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: -180,
                  right: rect.right,
              },
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: 180,
              },
          ]
        : rect;
}

function applyGap(rect: Rect, gap: number) {
    rect.top -= gap;
    rect.bottom += gap;
    rect.left += gap;
    rect.right -= gap;
}

export default function Map() {
    const [view, setView] = useState<Rect | [Rect, Rect] | undefined>(
        undefined
    );
    const [tileRegion, setTileRegion] = useState<TileRegion | undefined>(
        undefined
    );

    function handleCameraChanged(e: MapCameraChangedEvent) {
        const {
            north: top,
            south: bottom,
            west: left,
            east: right,
        } = e.detail.bounds;

        let view = trySplit({ top, bottom, left, right });
        let gapW;
        let gapH;

        if (isSplit(view)) {
            const [a, b] = view as [Rect, Rect];
            gapW = (a.right - a.left + (b.right - b.left)) * 0.3;
            gapH = (a.top - a.bottom) * 0.3;

            if (a.right - a.left < gapW) {
                view = b;
                view.top -= gapH;
                view.bottom += gapH;

                if (a.left == -180) {
                    view.right = 180 - (gapW - (a.right - a.left));
                    view.left += gapW;
                } else {
                    view.left = -180 + (gapW - (a.right - a.left));
                    view.right -= gapW;
                }
            } else if (b.right - b.left < gapW) {
                view = a;
                view.top -= gapH;
                view.bottom += gapH;

                if (b.left == -180) {
                    view.right = 180 - (gapW - (b.right - b.left));
                    view.left += gapW;
                } else {
                    view.left = -180 + (gapW - (b.right - b.left));
                    view.right -= gapW;
                }
            } else {
                console.log("a");
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
            view = view as Rect;
            gapW = (view.right - view.left) * 0.3;
            gapH = (view.top - view.bottom) * 0.3;
            view.top -= gapH;
            view.bottom += gapH;
            view.left += gapW;
            view.right -= gapW;
        }

        setView(view);
        // const nextTileRegion = getTileRegion({ top, bottom, left, right });

        // if (isEqual(nextTileRegion, tileRegion)) return;
        // setTileRegion(nextTileRegion);

        // sendMoveRequest(nextTileRegion, tileRegion);
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
                    {/* <Markers view={view} /> */}
                    <TestDisplay
                        view={view}
                        tileRegionArea={tileRegion?.area}
                    />
                </GoogleMap>
            </APIProvider>
        </div>
    );
}
