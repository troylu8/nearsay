"use client";

import { socket, socketfetch } from "@/lib/server";
import { createContext, useContext, useEffect, useState } from "react";
import { useJwt } from "./account-providers";
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
    const jwt = useJwt();
    const { userPos } = useGeolocation();
    
    function appendChatMsg(uid: string, msg: string) {
        console.log("appending chat msg", uid, msg);
        setChatMsgs(draft => {
            draft[uid] = draft[uid] ?? [];
            draft[uid].push([genID(), msg]);
        });
        
        console.log("timeout"); 
        setTimeout(() => {
            setChatMsgs(draft => {
                if (!draft[uid]) return;
                if (draft[uid].length == 1) delete draft[uid];
                else                        draft[uid].shift();
            });
        }, 3000);
    }
    
    useEffect(() => {
        socket.on("chat", ({uid, msg}) => appendChatMsg(uid, msg));
        socket.on("user-leave", uid => setChatMsgs(draft => delete draft[uid]));
        
        return () => { socket.removeAllListeners(); }
    }, []);
    
    function sendChatMsg(msg: string) {
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

