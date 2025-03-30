"use client";

import { socket, socketfetch } from "@/lib/server";
import { createContext, useContext, useEffect, useState } from "react";
import { useJWT } from "./account-providers";
import { toArrayCoords, useGeolocation } from "./geolocation-provider";
import { genID } from "@/lib/data";
import { useImmer } from "use-immer";


type ChatMsgs = Record<string, [string, string][]>;
type SendChatMsg = (msg: string) => void;
const ChatContext = createContext<[ChatMsgs, SendChatMsg] | null>(null);

export function useChat() {
    return useContext(ChatContext)!;
}

type Props = {
    children: React.ReactNode;
};
export default function ChatContextProvider({ children }: Props) {
    let [chatMsgs, setChatMsgs] = useImmer<ChatMsgs>({});
    const jwt = useJWT();
    const userPos = useGeolocation();
    
    function appendChatMsg(uid: string, msg: string) {
        setChatMsgs(draft => {
            draft[uid] = draft[uid] ?? [];
            draft[uid].push([genID(), msg]);
        });
        
        setTimeout(
            () => {
                setChatMsgs(draft => {
                    if (!draft[uid]) return;
                    if (draft[uid].length == 1) delete draft[uid];
                    else                        draft[uid].shift();
                });
            }, 
            5000
        );
    }
    
    useEffect(() => {
        const handleChat = ({uid, msg}: {uid: string, msg: string}) => appendChatMsg(uid, msg);
        const handleUserLeave = (uid: string) => setChatMsgs(draft => delete draft[uid]);
        socket.on("chat", handleChat);
        socket.on("user-leave", handleUserLeave);
        
        return () => {
            socket.removeListener("chat", handleChat);
            socket.removeListener("user-leave", handleUserLeave);
        }
    }, []);
    
    function sendChatMsg(msg: string) {
        msg = msg.trim();
        if (msg == "") return;
        
        if (userPos) {
            appendChatMsg("you", msg);
            socketfetch("chat", {jwt, msg, pos: toArrayCoords(userPos!)})
        }
    }

    return (
        <ChatContext.Provider value={[chatMsgs, sendChatMsg]}>
            {children}
        </ChatContext.Provider>
    );
}

