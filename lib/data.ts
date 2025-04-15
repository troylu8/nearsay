import { SERVER_URL } from "./server";
import { Vote } from "./types";

export async function fetchPost(jwt: string | undefined, post_id: string) {
    const headers: Record<string, string> = {};

    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    if (sessionStorage.getItem(post_id) == null) headers["Increment-View"] = "";
    
    const resp = await fetch(`${SERVER_URL}/posts/${post_id}`, {headers} );
    if (resp.ok) sessionStorage.setItem(post_id, "");
    
    return await resp.json();
}

export type FetchUserResp = {
    _id: string,
    username: string,
    avatar: number,
}

export async function fetchOnlineUser(uid: string) {
    const resp = await fetch(`${SERVER_URL}/users/online/${uid}`);
    return await resp.json() as FetchUserResp;
}

export function sendVote(jwt: string, post_id: string, vote: Vote) {
    return fetch(`${SERVER_URL}/vote/${post_id}`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + jwt },
        body: vote,
    });
}

export function genID() {
    const map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    
    let res = []; 
    
    for (let i = 0; i < 10; i++) 
        res.push(map[ crypto.getRandomValues(new Uint8Array(1))[0] >> 2 ])
    
    return res.join("");
}