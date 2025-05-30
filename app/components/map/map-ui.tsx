import { useMap } from "@vis.gl/react-google-maps";
import { UIButton } from "../colored-svg";
import { useCallback, useEffect, useState } from "react";
import { Circle } from "./circle";
import { useGeolocation } from "../../contexts/geolocation-provider";
import CreatePostModal from "../modal/create-post-modal";
import BindedInput from "../text-input";
import { useChat } from "@/app/contexts/chat-provider";

export default function MapUI() {
    const userPosAvailable = useGeolocation()[0] != null;
    return (
        <>
            { userPosAvailable &&
                <div className="fixed left-3 right-3 bottom-3 flex flex-col items-end gap-2 click-through-container">
                    <PanToSelfButton />
                    <PlaceNoteButton />
                    <ChatButton />
                </div>
            }
        </>
    );
}


function ChatButton() {
    const [_, sendChatMsg] = useChat();

    const [msg, setMsg] = useState("");
    const [chatboxVisible, setChatboxVisible] = useState(true);
    
    function handleSend() {
        sendChatMsg(msg);
        setMsg("");
    }

    return (
        <>
            <div className="w-full max-w-(--breakpoint-sm) flex gap-3 items-center justify-end click-through-container">
                {
                    chatboxVisible ?
                    <>
                        <UIButton
                            src="/icons/x.svg"
                            iconSize={10}
                            onClick={() => setChatboxVisible(false)}
                        />
                        <BindedInput
                            bind={[msg, setMsg]}
                            className="flex-1 bg-background" 
                            placeholder="type chat msg..."
                            maxChars={500}
                            onSubmit={handleSend}
                        />
                        <UIButton
                            src="/icons/send.svg"
                            iconSize={20}
                            onClick={handleSend}
                        />
                    </> :
                    <UIButton
                        src="/icons/chat.svg"
                        iconSize={20}
                        onClick={() => setChatboxVisible(true)}
                    >
                        chat
                    </UIButton>
                }
            </div>
        </>
    )
}

function PanToSelfButton() {
    const [userPos] = useGeolocation();
    const map = useMap();
    
    function panToUser() {
        map!.setCenter(userPos!);
        map!.setZoom(Math.max(17, map!.getZoom()!)); // zoom in if map is zoomed out more than 17
    }

    return userPos && (
        <UIButton
            src="/icons/location.svg"
            iconSize={20}
            onClick={panToUser}
        />
    );
}

function PlaceNoteButton() {
    const [userPos] = useGeolocation();
    const map = useMap();
    const [placing, setPlacing] = useState(false);
    
    function handlePlaceNote() {
        if (!userPos || !map) return;
        
        // if user is offscreen OR too zoomed out
        if (!map.getBounds()?.contains(userPos) || map.getZoom()! < 15) {
            map.panTo(userPos);
            map.setZoom(17);
        }
        
        setPlacing(true);
    }

    return (
        <>
            {placing? 
                <PlacingOverlay setPlacing={setPlacing} /> :
                <UIButton
                    src="/icons/new-post.svg"
                    iconSize={20}
                    onClick={handlePlaceNote}
                >
                    place note
                </UIButton>
            }
        </>
    )
}

/** allowed to place notes within this distance from current location */
const PLACE_NOTE_RANGE_METERS = 100;


type PlacingOverlayProps = {
    setPlacing: (nextPlacing: boolean) => any;
};
function PlacingOverlay({ setPlacing }: PlacingOverlayProps) {
    const [userPos] = useGeolocation();
    const map = useMap();
    
    const getInRange = useCallback(
        () =>
            map != null &&
            google.maps.geometry.spherical.computeDistanceBetween(
                map.getCenter()!,
                userPos!
            ) < PLACE_NOTE_RANGE_METERS,
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
                    <Circle 
                        center={userPos} 
                        radius={PLACE_NOTE_RANGE_METERS} 
                        strokeColor="#658d9f" 
                        fillColor="#658d9f" 
                        fillOpacity={0.15}
                    />
                
                    <Crosshair color={inRange? "success" : "failure"}/>
                    
                    <div className="fixed left-1/2 -translate-x-1/2 bottom-1/4 flex items-center justify-center gap-3 click-through-container">
                        <button
                            className={`px-3 py-1 rounded-md text-background ${inRange ? "bg-success" : "bg-failure"}`}
                            onClick={() => inRange && setDrafting(true)}
                        >
                            {inRange
                                ? "place note"
                                : "you're too far away!"}
                        </button>
                        
                        <UIButton
                            src="/icons/x.svg"
                            iconSize={15}
                            onClick={() => setPlacing(false)}
                        />
                        
                        {!inRange && 
                            <p className="
                                absolute top-full mt-1 left-1/2 -translate-x-1/2 
                                text-sm text-center w-max [--outline-color:white] text-outline
                                
                            "> 
                                * get within {PLACE_NOTE_RANGE_METERS}m to leave a note here
                            </p>
                        }
                    </div>
                </>
            )}
        </>
    );
}

type CrosshairProps = {
    color: string
}
function Crosshair({ color }: CrosshairProps) {
    
    const dimensions = "absolute w-0.5 h-2.5 rounded-[1px] outline-[1.5px] outline-white"
    return (
        <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`${dimensions} bg-${color} translate-y-[10px]`}></div>
            <div className={`${dimensions} bg-${color} -translate-y-[10px]`}></div>
            <div className={`${dimensions} bg-${color} translate-x-[10px] rotate-90`}></div>
            <div className={`${dimensions} bg-${color} -translate-x-[10px] rotate-90`}></div>
        </div>
    );
}