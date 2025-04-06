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
import ColoredSvg from "../colored-svg";

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
    
    return (
        <>
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
            </GoogleMap>
            <MapUI />
            <PanToUserOnceGeolocationReady />
        </>
    )
}


function PanToUserOnceGeolocationReady() {
    const map = useMap();
    const [_, onGeolocationOrErr] = useGeolocation();
    const [text, setText] = useState<string | null>("finding your location..");
    const [isError, setIsError] = useState(false);
    const [fading, setFading] = useState<boolean>(false);
    
    // pan to user location is found
    useEffect(() => {
        if (!map) return; 
        
        onGeolocationOrErr(
            userPos => {
                map.panTo(userPos);
                setText("found your location!");
                setTimeout(() => setFading(true), 750);
            },
            err => {
                switch (err.code) {
                    case GeolocationPositionError.PERMISSION_DENIED: 
                        setText("you've denied access to your location");
                        break;
                        
                    case GeolocationPositionError.POSITION_UNAVAILABLE: 
                        setText("your location is unavailable");
                        break;
                        
                    case GeolocationPositionError.TIMEOUT: 
                        setText("timed out trying to find your location");
                        break;
                        
                    default: 
                        setText(err.message);
                }
                setIsError(true);
            }
        );
    }, [map]);
    
    return text && (
        <div
            className={`
                fixed top-[10%] left-1/2 -translate-x-1/2 
                flex items-center w-max gap-3
                rounded-full bg-primary px-3 py-1 text-sm text-background
                ${fading && "anim-fade-out"}
            `}
            onAnimationEnd={e => {
                if (e.animationName == "fade-out") setText(null);
            }}
        > 
            {isError && <p> (;°Д°) </p>}
            
            <p> { text } </p>
            
            {    isError && 
                <ColoredSvg 
                    src="/icons/x.svg" 
                    width={15} 
                    height={15} 
                    color="var(--color-background)"
                    onClick={() => setFading(true)}
                />
            }
        </div>
    );
}