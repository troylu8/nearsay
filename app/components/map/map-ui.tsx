import { useMap } from "@vis.gl/react-google-maps";
import ColoredSvg from "../colored-svg";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Circle } from "./circle";
import { toArrayCoords, useGeolocation } from "../../contexts/geolocation-provider";
import CreatePostModal from "../modal/create-post-modal";
import BindedInput from "../text-input";
import { useChat } from "@/app/contexts/chat-provider";

export default function MapUI() {
    return (
        <>
            <div className="fixed left-3 right-3 bottom-3 flex flex-col items-end gap-2 pointer-events-none [&>*]:pointer-events-auto">
                <PanToSelfButton />
                <PlaceNoteButton />
                <ChatButton />
            </div>
        </>
    );
}


type UIButtonProps = {
    src: string,
    iconSize: number,
    background?: string,
    onClick: () => any,
    children?: ReactNode,
}
function UIButton({ src, iconSize, background = "var(--color-primary)", onClick, children }: UIButtonProps) {
    return (
        <div 
            className={`flex items-center gap-2 p-2 rounded-md bg-[${background}] cursor-pointer self-end`}
            onClick={onClick}
        >
            <ColoredSvg 
                src={src} 
                width={iconSize} 
                height={iconSize} 
                color="var(--color-background)"
            />
            
            {children && <label className="cursor-pointer text-background"> { children } </label> }
        </div>
    )
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
            <div className="w-full max-w-(--breakpoint-sm) flex gap-3 items-center justify-end">
                <UIButton
                    src={chatboxVisible? "/icons/collapse.svg" : "/icons/chat.svg"}
                    iconSize={20}
                    onClick={() => setChatboxVisible(!chatboxVisible)}
                >
                    {!chatboxVisible && "chat"}
                </UIButton>
                
                {
                    chatboxVisible && 
                    <>
                        <BindedInput
                            bind={[msg, setMsg]}
                            className="flex-1 rounded-md border-2 border-primary p-1 bg-background" 
                            placeholder="shout to the world..."
                            onSubmit={handleSend}
                        />
                        <UIButton
                            src="/icons/send.svg"
                            iconSize={20}
                            onClick={handleSend}
                        />
                    </>
                }
            </div>
        </>
    )
}

function PanToSelfButton() {
    const [userPos] = useGeolocation();
    const map = useMap();

    function panToUser() {
        map?.setCenter(userPos!);
        map?.setZoom(17);
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
    const [placing, setPlacing] = useState(false);

    return (
        <>
            {placing? 
                <PlacingOverlay setPlacing={setPlacing} /> :
                    <UIButton
                    src="/icons/new-post.svg"
                    iconSize={20}
                    onClick={() => setPlacing(!placing)}
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
                    <Circle center={userPos} radius={PLACE_NOTE_RANGE_METERS} />

                    <ColoredSvg
                        src="/icons/star.svg"
                        width={40}
                        height={40}
                        color={inRange ? "green" : "red"}
                        className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    
                    <div className="fixed left-1/2 -translate-x-1/2 bottom-[10%] flex items-center justify-center gap-3">
                        <button
                            className={`px-3 py-1 ${inRange ? "bg-success" : "bg-failure"}`}
                            onClick={() => inRange && setDrafting(true)}
                        >
                            {inRange
                                ? "place note"
                                : "can't place note this far away"}
                        </button>
                        
                        <UIButton
                            src="/icons/x.svg"
                            iconSize={20}
                            background="var(--color-failure)"
                            onClick={() => setDrafting(false)}
                        />
                            
                    </div>
                </>
            )}
        </>
    );
}
