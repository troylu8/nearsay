"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import ColoredSvg from "../components/colored-svg";
import { genID } from "@/lib/data";


const NotificationsContext = createContext<(notif: ReactNode) => void>(() => {});


export function useNotifications() {
    return useContext(NotificationsContext);
}


type Props = { children: ReactNode };
export function NotificationsContextProvider({ children }: Props) {
    const [notifs, setNotifs] = useState<[string, ReactNode][]>([]);
    

    function removeNotif(notifID: string) {
        setNotifs(prevNotifs => prevNotifs.filter(([id]) => id != notifID));
    }

    function sendNotification(notifContent: ReactNode) {
        let id = genID();
        setNotifs(prevNotifs => [[id, notifContent], ...prevNotifs]);
    }

    return (
        <NotificationsContext.Provider value={sendNotification}>
            {children}
            <div 
                className="
                    fixed left-0 right-0 bottom-0 top-0  z-10
                    flex flex-col-reverse gap-3 m-3 pointer-events-none"
            >
                { 
                    notifs.map(([id, content]) => (
                        <Notification key={id} onClose={() => removeNotif(id)}> 
                            {content} 
                        </Notification>
                    )) 
                }
            </div>
        </NotificationsContext.Provider>
    );
}

type NotificationProps = {
    children: ReactNode,
    onClose: () => void
}
function Notification({ children, onClose }: NotificationProps) {
    const [slidingAway, setSlidingAway] = useState(false);
    
    useEffect(() => {
        setTimeout(() => setSlidingAway(true), 3000)
    }, []);
    
    return (
        <div 
            className={`
                bg-primary text-background rounded-md p-2 pointer-events-auto self-start flex gap-3 items-center
                ${slidingAway? "anim-slide-fade-out" : "anim-slide-fade-in"}
            `}
            onAnimationEnd={({animationName}) => {
                if (animationName == "slide-fade-out") onClose()
            }}
        >
            {children}
            
            <ColoredSvg 
                src="/icons/x.svg" 
                width={20}
                height={20} 
                color="white" 
                className={`cursor-pointer min-w-[20px] ${slidingAway && "pointer-events-none"}`}
                onClick={() => setSlidingAway(true)}
            />
        </div>
    )
}