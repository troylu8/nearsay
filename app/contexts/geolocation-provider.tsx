"use client";

import { socketfetch } from "@/lib/server";
import { createContext, useContext, useEffect, useState } from "react";

const GeolocationContext = createContext<google.maps.LatLngLiteral | null>(null);

export function useGeolocation() {
    return useContext(GeolocationContext);
}
export function toArrayCoords(latlng: google.maps.LatLngLiteral): [number, number] {
    return [latlng.lng, latlng.lat];
}

type Props = {
    children: React.ReactNode;
};
export default function GeolocationContextProvider({ children }: Props) {
    const [geolocation, setGeolocation] = useState<google.maps.LatLngLiteral | null>(null);

    useEffect(() => {
        const watchId = navigator.geolocation?.watchPosition(
            (pos) => {
                setGeolocation({
                    lng: pos.coords.longitude,
                    lat: pos.coords.latitude,
                });
            },
            (err) => setGeolocation(null),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation?.clearWatch(watchId);
    }, []);

    return (
        <GeolocationContext.Provider value={geolocation}>
            {children}
        </GeolocationContext.Provider>
    );
}

export function onceGeolocationReady(currPos: google.maps.LatLngLiteral | null, action: (pos: google.maps.LatLngLiteral) => any) {
    if (currPos) action(currPos);
    else {
        const watchId = navigator.geolocation?.watchPosition(
            ({coords}) => {
                action({lng: coords.longitude, lat: coords.latitude})
                navigator.geolocation?.clearWatch(watchId);
            },
            null,
            { enableHighAccuracy: true }
        );
    }
}