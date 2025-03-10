import path from "path";
import { clientSocket, emitAsync, SERVER_URL } from "./server";
import { Vote } from "./types";

clientSocket.on("new-poi", (poi: any) => {
    console.log("received new poi event", poi);
});

clientSocket.on("chat", ({uid, msg}) => {
    console.log(uid, msg);
});



export async function fetchPost(jwt: string | null, post_id: string) {
    const headers: Record<string, string> = {};

    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    if (sessionStorage.getItem(post_id) == null) headers["Increment-View"] = "";
    
    const resp = await fetch(path.join(SERVER_URL, "posts", post_id), {headers} );
    if (resp.ok) sessionStorage.setItem(post_id, "");
    
    return await resp.json();
}

export function sendPostEvent(pos: [number, number], body: string) {
    clientSocket.emit("post", { pos, body });
}



export function sendVoteRequest(jwt: string, post_id: string, vote: Vote) {
    return fetch(path.join(SERVER_URL, "vote", post_id), {
        method: "POST",
        headers: { "Authorization": "Bearer " + jwt },
        body: vote,
    });
}