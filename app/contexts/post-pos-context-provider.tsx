"use client";

import { useContext, createContext, useState, useRef } from "react";
import { Pos } from "@/lib/types";

type PostPosState = [Pos | null, (id: string | null, pos?: Pos) => void];

const PostPosContext = createContext<PostPosState>([null, () => {}]);

export function usePostPos() {
    return useContext(PostPosContext);
}

type Props = {
    children: React.ReactNode;
};
export default function PostPosContextProvider({ children }: Props) {
    const postIdRef = useRef<string>("");

    const [postPos, setPostPos] = useState<Pos | null>(null);

    function updatePostPos(id: string | null, pos?: Pos) {
        if (!id) return setPostPos(null);

        if (postIdRef.current != id) {
            setPostPos(pos!);
        }
    }

    return (
        <PostPosContext.Provider value={[postPos, updatePostPos]}>
            {children}
        </PostPosContext.Provider>
    );
}
