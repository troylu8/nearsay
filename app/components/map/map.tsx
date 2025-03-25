"use client";

import {
    APIProvider,
    Map as GoogleMap,
    MapCameraChangedEvent,
    useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { usePostPos } from "../../contexts/post-pos-provider";
import { useGeolocation } from "../../contexts/geolocation-provider";
import Markers from "./markers";
import MapUI from "./map-ui";

const DEFAULT_ZOOM = 17;

export default function Map() {
    const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
    const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
    console.log(bounds);

    const { userPos } = useGeolocation();

    function handleCameraChanged(e: MapCameraChangedEvent) {
        setZoomLevel(e.map.getZoom() ?? DEFAULT_ZOOM);
        setBounds(e.detail.bounds);
    }

    return (
        <div className="fixed w-full h-full">
            <APIProvider
                apiKey="AIzaSyBgV8sJcZGdGYATLA74sLNWb17JneaDXVE"
                libraries={["geometry"]}
            >
                <GoogleMap
                    mapId="4cd1599c3ca39378"
                    defaultZoom={DEFAULT_ZOOM}
                    maxZoom={18}
                    minZoom={3}
                    defaultCenter={userPos}
                    disableDefaultUI
                    keyboardShortcuts={false}
                    onCameraChanged={handleCameraChanged}
                >
                    {bounds && <Markers zoomLevel={zoomLevel} bounds={bounds} />}
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

