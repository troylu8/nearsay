"use client";

import { createContext, useContext, useEffect, useState } from "react";

type OnGeolocationOrErr = (action: (pos: google.maps.LatLngLiteral) => any, onErr?: (e: GeolocationPositionError) => any) => any;
const GeolocationContext = createContext<[google.maps.LatLngLiteral | null, OnGeolocationOrErr] | null>(null);

export function useGeolocation() {
    return useContext(GeolocationContext)!;
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
            err => {
                console.error(err);
                setGeolocation(null)
            },
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation?.clearWatch(watchId);
    }, []);
    
    function onGeolocationOrErr(action: (pos: google.maps.LatLngLiteral) => any, onErr?: (e: GeolocationPositionError) => any) {
        if (geolocation) action(geolocation);
        else {
            const watchId = navigator.geolocation?.watchPosition(
                ({coords}) => {
                    action({lng: coords.longitude, lat: coords.latitude})
                    navigator.geolocation?.clearWatch(watchId);
                },
                err => {
                    console.error(err);
                    if (onErr) onErr(err);
                    navigator.geolocation?.clearWatch(watchId);
                },
                { enableHighAccuracy: true }
            );
        }
    }

    return (
        <GeolocationContext.Provider value={[geolocation, onGeolocationOrErr]}>
            {children}
        </GeolocationContext.Provider>
    );
}