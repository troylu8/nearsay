"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Geolocation = {
    pos?: google.maps.LatLngLiteral;
    err?: GeolocationPositionError;
};
const GeolocationContext = createContext<Geolocation>({});

export function useGeolocation() {
    return useContext(GeolocationContext);
}

type Props = {
    children: React.ReactNode;
};
export default function GeolocationContextProvider({ children }: Props) {
    const [geolocation, setGeolocation] = useState<Geolocation>(
        { pos: { lng: 139.6917, lat: 35.6895 } } // default location is tokyo
    );

    useEffect(() => {
        const watchId = navigator.geolocation?.watchPosition(
            (pos) => {
                setGeolocation({
                    pos: {
                        lng: pos.coords.longitude,
                        lat: pos.coords.latitude,
                    },
                });
            },
            (err) => setGeolocation({ ...geolocation, err }),
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
