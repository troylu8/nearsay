"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import ColoredSvg from "../components/colored-svg";


const NotificationsContext = createContext<(notif: ReactNode) => any>(() => {});


export function useNotifications() {
    return useContext(NotificationsContext);
}


type Props = { children: ReactNode };
export function NotificationsContextProvider({ children }: Props) {
    const [notifs, setNotifs] = useState<ReactNode[]>([]);

    function removeNotif(notifContent: ReactNode) {
        setNotifs(prevNotifs => prevNotifs.filter(n => n != notifContent));
    }

    function sendNotification(notifContent: ReactNode) {
        setNotifs(prevNotifs => [...prevNotifs, notifContent]);
        setTimeout(() => removeNotif(notifContent), 3000);
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
                    notifs.map((content, i) => (
                        <div 
                            key={i} 
                            className="bg-slate-500 rounded-md p-2 pointer-events-auto self-start
                                        flex gap-3 items-center"
                            
                            // interacting with this notification removes it
                            onClick={() => removeNotif(content)} 
                        >
                            {content}
                            
                            <ColoredSvg 
                                src="/icons/x.svg" 
                                width={20}
                                height={20} 
                                color="white" 
                                className="cursor-pointer min-w-[20px]"
                                onClick={() => removeNotif(content)}
                            />
                        </div>
                    )) 
                }
            </div>
        </NotificationsContext.Provider>
    );
}