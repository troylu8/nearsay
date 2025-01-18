import { pxToDegrees } from "@/lib/area";
import { distanceBetweenPoints } from "@googlemaps/markerclusterer";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

type Props = {
    userPos: google.maps.LatLngLiteral;
};
export default function PanToUser({ userPos }: Props) {
    const map = useMap()!;

    const [show, setShow] = useState(false);

    function handlePanToUser() {
        map.panTo(userPos);
        setShow(false);
    }

    useEffect(() => {
        const bounds = map?.getBounds();
        if (bounds) setShow(!bounds.contains(userPos));
    }, [map, userPos, map?.getBounds()]);

    return (
        <>
            {show && (
                <button
                    className="fixed right-3 bottom-3 bg-slate-100"
                    onClick={handlePanToUser}
                >
                    to me
                </button>
            )}
        </>
    );
}

function distp(a: google.maps.Point, b: google.maps.Point) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function dist(a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) {
    return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}
function bound(latlng: google.maps.LatLngLiteral) {
    const val = latlng.lng;

    const amt = val < 0 ? Math.ceil(val / 180) : Math.floor(val / 180);
    const ex = val % 180;

    if (amt % 2 == 0) latlng.lng = ex;
    else latlng.lng = -Math.sign(val) * 180 + ex;

    return latlng;
}
