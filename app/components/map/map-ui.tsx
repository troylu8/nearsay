import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import ColoredSvg from "../colored-svg";
import { useCallback, useEffect, useRef, useState } from "react";
import { Circle } from "./circle";
import { toArrayCoords, useGeolocation } from "../../contexts/geolocation-provider";
import CreatePostModal from "../modal/create-post-modal";
import { useAvatar, useJwt } from "@/app/contexts/account-providers";
import BindedInput from "../text-input";
import { emitAsync } from "@/lib/server";

export default function MapUI() {
    
    const { userPos } = useGeolocation();
    const avatar = useAvatar()[0];

    

    return (
        <>
            
            {userPos && <AvatarMarker key="you are here" pos={userPos} avatar={avatar!} username="you" />}

            <div className="fixed left-3 right-3 bottom-3 flex flex-col items-end">
                {userPos && <PanToButton pos={userPos} />}
                <PlaceNoteButton />
                <ChatButton />
            </div>
        </>
    );
}

function ChatButton() {
    const jwt = useJwt();
    const { userPos } = useGeolocation();

    const [msg, setMsg] = useState("");
    const [chatboxVisible, setChatboxVisible] = useState(true);
    
    if (jwt == null || !userPos) return;
    
    function handleSend() {
        emitAsync("chat", {jwt, msg, pos: toArrayCoords(userPos!)})
    }

    return (
        <>
            <div className="w-full max-w-screen-sm flex gap-3 items-end justify-end">
                <button onClick={() => setChatboxVisible(!chatboxVisible)}> 
                    {chatboxVisible? "hide chat" : "show chat"} 
                </button>
                {
                    chatboxVisible && 
                    <>
                        <BindedInput
                            bind={[msg, setMsg]}
                            className="flex-1 rounded-md" 
                            placeholder="shout to the world..."
                            onSubmit={handleSend}
                        />
                        <button onClick={handleSend}> send </button>
                    </>
                }
            </div>
        </>
    )
}

type AvatarMarkerProps = {
    pos: google.maps.LatLngLiteral,
    avatar: string,
    username: string
}
function AvatarMarker({ pos, avatar, username }: AvatarMarkerProps) {
    return (
        <>
            <AdvancedMarker position={pos}>
                <div className="avatar translate-y-1/2 bg-red-600 ">
                    { avatar }
                    <p>{username}</p>
                </div>
            </AdvancedMarker>
        </>
    )
}

function PanToButton({ pos }: { pos: google.maps.LatLngLiteral }) {

    const map = useMap();

    function panToUser() {
        map?.setCenter(pos);
        map?.setZoom(17);
    }

    return <button onClick={panToUser}> to me </button>;
}

function PlaceNoteButton() {
    const [placing, setPlacing] = useState(false);

    return (
        <>
            {placing && <PlacingOverlay setPlacing={setPlacing} />}

            <button onClick={() => setPlacing(!placing)}>
                {placing ? "cancel" : "place note"}
            </button>
        </>
    )
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
