"use client";

import { createContext, ReactNode, useContext, useState } from "react";
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
        setNotifs(prevNotifs => [...prevNotifs, [id, notifContent]]);
        setTimeout(() => removeNotif(id), 3000);
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
                    // wrap notifs in a div with a key
                    notifs.map(([id, content]) => (
                        <div 
                            key={id} 
                            className="bg-slate-500 rounded-md p-2 pointer-events-auto self-start
                                        flex gap-3 items-center"
                            
                            // interacting with this notification removes it
                            onClick={() => removeNotif(id)} 
                        >
                            {content}
                            
                            <ColoredSvg 
                                src="/icons/x.svg" 
                                width={20}
                                height={20} 
                                color="white" 
                                className="cursor-pointer min-w-[20px]"
                                onClick={() => removeNotif(id)}
                            />
                        </div>
                    )) 
                }
            </div>
        </NotificationsContext.Provider>
    );
}