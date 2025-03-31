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
    return (
        <div className="fixed w-full h-full">
            <APIProvider
                apiKey="AIzaSyAS5p3YyOhKpqNCVL-KKO4oETgCXiRK5tU"
                libraries={["geometry"]}
            >
                <MapInner />
            </APIProvider>
        </div>
    );
}

function MapInner() {
    const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM);
    const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
    const map = useMap();

    function handleCameraChanged(e: MapCameraChangedEvent) {
        setZoomLevel(e.map.getZoom() ?? DEFAULT_ZOOM);
        setBounds(e.detail.bounds);
    }
    
    const [postPos] = usePostPos();
    
    // center map on opened post if it was offscreen (can happen if post was opened via navigating to link)
    useEffect(() => {
        console.log("postpos", postPos);
        if (postPos) {
            const postPosLatLng: google.maps.LatLngLiteral = {
                lng: postPos![0],
                lat: postPos![1],
            };
            if (!map?.getBounds()?.contains(postPosLatLng)) {
                console.log("panning to post");
                map?.panTo(postPosLatLng);
            }
        }
    }, [map, postPos]);
    
    const [_, onceGeolocationReady] = useGeolocation();
    
    // pan to user location is found
    useEffect(() => {
        if (map) {
            onceGeolocationReady(userPos => {
                console.log("user pos ready, panning");
                map.panTo(userPos);
            });
        }
    }, [map]);
    
    return (
        <GoogleMap
            mapId="d52f7c6d2453d540"
            defaultZoom={DEFAULT_ZOOM}
            maxZoom={18}
            minZoom={3}
            defaultCenter={{lng: -0.12574, lat: 51.50853}}
            disableDefaultUI
            keyboardShortcuts={false}
            onCameraChanged={handleCameraChanged}
        >
            {bounds && <Markers zoomLevel={zoomLevel} bounds={bounds} />}
            <MapUI />
        </GoogleMap>
    )
}