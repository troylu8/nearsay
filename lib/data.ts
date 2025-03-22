import path from "path";
import { SERVER_URL } from "./server";
import { Vote } from "./types";

export async function fetchPost(jwt: string | null, post_id: string) {
    const headers: Record<string, string> = {};

    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    if (sessionStorage.getItem(post_id) == null) headers["Increment-View"] = "";
    
    const resp = await fetch(path.join(SERVER_URL, "posts", post_id), {headers} );
    if (resp.ok) sessionStorage.setItem(post_id, "");
    
    return await resp.json();
}

export function sendVoteRequest(jwt: string, post_id: string, vote: Vote) {
    return fetch(path.join(SERVER_URL, "vote", post_id), {
        method: "POST",
        headers: { "Authorization": "Bearer " + jwt },
        body: vote,
    });
}