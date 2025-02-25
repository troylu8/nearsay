import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import ColoredSvg from "../colored-svg";
import { useCallback, useEffect, useRef, useState } from "react";
import { Circle } from "./circle";
import { useGeolocation } from "../../contexts/geolocation-provider";
import CreatePostModal from "../modal/create-post-modal";
import { useAvatar } from "@/app/contexts/account-providers";

export default function MapUI() {
    const { userPos } = useGeolocation();
    const [avatar, _] = useAvatar();


    const map = useMap();

    const [placing, setPlacing] = useState(false);

    function panToUser() {
        map?.setCenter(userPos!);
        map?.setZoom(17);
    }

    return (
        <>
            <AdvancedMarker key="you are here" position={userPos}>
                <div className="avatar translate-y-1/2 bg-red-600 ">
                    { avatar }
                    <p>you</p>
                </div>
            </AdvancedMarker>

            {placing && <PlacingOverlay setPlacing={setPlacing} />}

            <div className="fixed right-3 bottom-3 flex flex-col">
                <button onClick={panToUser}>to me</button>
                <button onClick={() => setPlacing(!placing)}>
                    {placing ? "cancel" : "place note"}
                </button>
            </div>
        </>
    );
}

type PlacingOverlayProps = {
    setPlacing: (nextPlacing: boolean) => any;
};

// range in meters where you can place notes
const PLACE_NOTE_RANGE = 100;

function PlacingOverlay({ setPlacing }: PlacingOverlayProps) {
    const { userPos } = useGeolocation();
    const map = useMap();

    const getInRange = useCallback(
        () =>
            map != null &&
            google.maps.geometry.spherical.computeDistanceBetween(
                map.getCenter()!,
                userPos!
            ) < PLACE_NOTE_RANGE,
        []
    );

    const [inRange, setInRange] = useState(getInRange());

    useEffect(() => {
        const centerChangedListener = map!.addListener("center_changed", () =>
            setInRange(getInRange())
        );

        return () => centerChangedListener.remove();
    }, [map]);

    const [drafting, setDrafting] = useState(false);

    return (
        <>
            {drafting ? (
                <CreatePostModal
                    pos={map?.getCenter()!}
                    onPost={() => setPlacing(false)}
                    onCancel={() => setDrafting(false)}
                />
            ) : (
                <>
                    <Circle center={userPos} radius={PLACE_NOTE_RANGE} />

                    <ColoredSvg
                        src="/icons/star.svg"
                        width={40}
                        height={40}
                        color={inRange ? "green" : "red"}
                        className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
                    />

                    <button
                        className={`fixed left-1/2 -translate-x-1/2 bottom-[10%] rounded-md px-3 py-1 ${
                            inRange ? "bg-green-500" : "bg-red-300"
                        }`}
                        onClick={() => inRange && setDrafting(true)}
                    >
                        {inRange
                            ? "place note"
                            : "can't place note this far away"}
                    </button>
                </>
            )}
        </>
    );
}
