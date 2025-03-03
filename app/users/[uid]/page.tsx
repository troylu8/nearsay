"use client";

import Modal from "@/app/components/modal/modal";
import NotFound from "@/app/not-found";
import { EMOTICONS } from "@/lib/emoticon";
import { SERVER_URL } from "@/lib/server";
import { User } from "@/lib/types";
import path from "path";
import { use } from "react";
import useSWR from "swr";

type UseUserType = {
    data?: User;
    error?: Error;
    isLoading: boolean;
};
function useUser(uid: string): UseUserType {
    return useSWR(uid, async () => {
        const resp = await fetch(path.join(SERVER_URL, "users", uid))
        return await resp.json();
    });
}

type Props = {
    params: Promise<{ uid: string }>;
};
export default function Page({ params }: Props) {

    const { uid } = use(params);
    const { data, error, isLoading } = useUser(uid);

    //TODO: error page instead of not found page
    if (error) return <NotFound />;
    if (!data || isLoading) return <></>; //TODO: loading

    console.log(data);

    return (
        <Modal title="post">
            <div className="h-full m-5 mb-7 overflow-y-auto">
                <div className="avatar self-center">{EMOTICONS[data.avatar]}</div>
                <p> {data.username} </p>
            </div>
        </Modal>
    );
}