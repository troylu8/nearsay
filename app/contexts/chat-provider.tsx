"use client";

import { socket } from "@/lib/server";
import { createContext, useContext, useEffect, useState } from "react";


type AppendChatMsgToSelf = (msg: string) => void;
const ChatContext = createContext<[Record<string, string[]>, AppendChatMsgToSelf] | null>(null);

export function useChat() {
    return useContext(ChatContext)!;
}

type Props = {
    children: React.ReactNode;
};
export default function ChatContextProvider({ children }: Props) {
    let [chatMsgs, setChatMsgs] = useState<Record<string, string[]>>({});
    
    function appendChatMsg(uid: string, msg: string) {
        
        setChatMsgs(prev => ({...prev, [uid]: [...prev.uid, msg] }) );
        
        setTimeout(() => {
            chatMsgs[uid].shift();
            if (chatMsgs[uid].length == 0) delete chatMsgs[uid];
        }, 5000);
    }
    
    useEffect(() => {
        socket.on("chat", appendChatMsg);
        socket.on("user-leave", uid => {
            delete chatMsgs[uid];
        });
        
        return () => { socket.removeAllListeners(); }
    }, []);

    return (
        <ChatContext.Provider value={[chatMsgs, msg => appendChatMsg("self", msg)]}>
            {children}
        </ChatContext.Provider>
    );
}
