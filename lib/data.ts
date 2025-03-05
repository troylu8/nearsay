import { SplitTileRegion } from "@/lib/area";
import path from "path";
import { POI, POIManager, Vote } from "./types";
import { clientSocket, emitAsync, SERVER_URL } from "./server";

export const pois = new POIManager();

clientSocket.on("new-poi", (poi: any) => {
    console.log("received new poi event", poi);
    pois.addOrUpdate(poi);
});

clientSocket.on("chat", ({uid, msg}) => {
    console.log(uid, msg);
});

type MoveResponse = {
    /** list of poi ids to delete */
    delete: string[];
    /** list of pois to add/update */
    fresh: POI[];
};
export async function sendViewShiftEvent(curr: SplitTileRegion, prev: SplitTileRegion) {
    const timestamps: Record<string, number> = {};

    const searchRects = curr.filter(tilereg => tilereg != undefined)
                            .map(tilereg => tilereg.area)

    for (const poi of pois.search(...searchRects)) {
        timestamps[poi._id] = poi.updated;
    }

    const resp = await emitAsync<MoveResponse>("view-shift", { curr, prev, timestamps });
    for (const _id of resp.delete) {
        pois.remove(_id);
    }
    for (const poi of resp.fresh) {
        pois.addOrUpdate(poi);
    }
}


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