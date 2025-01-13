"use client";

import {
    useContext,
    createContext,
    useState,
    Dispatch,
    SetStateAction,
    useRef,
} from "react";
import { Pos, Post } from "@/lib/data";

type PostPosStatePair = [Pos | null, (id: string, pos: Pos) => void];

const PostPosContext = createContext<PostPosStatePair | null>(null);

export function usePostPos() {
    return useContext(PostPosContext);
}

type Props = {
    children: React.ReactNode;
};
export default function PostPosContextProvider({ children }: Props) {
    const postIdRef = useRef<string>("");

    const [postPos, setPostPos] = useState<Pos | null>(null);

    function updatePostPos(id: string, pos: Pos) {
        if (postIdRef.current != id) {
            setPostPos(pos);
        }
    }

    return (
        <PostPosContext.Provider value={[postPos, updatePostPos]}>
            {children}
        </PostPosContext.Provider>
    );
}
