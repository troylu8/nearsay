"use client";

import {
    APIProvider,
    Map as GoogleMap,
    MapCameraChangedEvent,
    MapProps,
} from "@vis.gl/react-google-maps";
import { FunctionComponent, useRef, useState } from "react";
import { sendMoveRequest } from "@/lib/post";

import { getTileRegion, isEqual, Rect, TileRegion } from "@/lib/area";
import { Polygon } from "./polygon";
import Markers from "./markers";

export default function Map() {
    const [view, setView] = useState<Rect | undefined>(undefined);
    const [tileRegion, setTileRegion] = useState<TileRegion | undefined>(
        undefined
    );

    function handleCameraChanged(e: MapCameraChangedEvent) {
        const testGapW = (e.detail.bounds.east - e.detail.bounds.west) * 0.3;
        const testGapH = (e.detail.bounds.north - e.detail.bounds.south) * 0.3;
        e.detail.bounds.north -= testGapH;
        e.detail.bounds.south += testGapH;
        e.detail.bounds.west += testGapW;
        e.detail.bounds.east -= testGapW;

        const {
            north: top,
            south: bottom,
            west: left,
            east: right,
        } = e.detail.bounds;

        setView({ top, bottom, left, right });
        const nextTileRegion = getTileRegion({ top, bottom, left, right });

        if (isEqual(nextTileRegion, tileRegion)) return;
        setTileRegion(nextTileRegion);

        sendMoveRequest(nextTileRegion, tileRegion);
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

                    {/* view */}
                    {view && (
                        <Polygon
                            paths={[
                                [
                                    {
                                        lng: view.left,
                                        lat: view.top,
                                    },
                                    {
                                        lng: view.right,
                                        lat: view.top,
                                    },
                                    {
                                        lng: view.right,
                                        lat: view.bottom,
                                    },
                                    {
                                        lng: view.left,
                                        lat: view.bottom,
                                    },
                                    {
                                        lng: view.left,
                                        lat: view.top,
                                    },
                                ],
                            ]}
                        />
                    )}

                    {/* snapped view */}
                    {tileRegion && (
                        <Polygon
                            paths={[
                                [
                                    {
                                        lng: tileRegion.area.left,
                                        lat: tileRegion.area.top,
                                    },
                                    {
                                        lng: tileRegion.area.right,
                                        lat: tileRegion.area.top,
                                    },
                                    {
                                        lng: tileRegion.area.right,
                                        lat: tileRegion.area.bottom,
                                    },
                                    {
                                        lng: tileRegion.area.left,
                                        lat: tileRegion.area.bottom,
                                    },
                                    {
                                        lng: tileRegion.area.left,
                                        lat: tileRegion.area.top,
                                    },
                                ],
                            ]}
                        />
                    )}
                </GoogleMap>
            </APIProvider>
        </div>
    );
}
