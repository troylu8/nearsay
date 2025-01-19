import { io } from "socket.io-client";
import { SplitTileRegion } from "@/lib/area";
import path from "path";
import { POI, pois } from "./data";

const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443/";

const clientSocket = io(SERVER_URL);

clientSocket.on("new-poi", (poi: POI) => {
    pois.addOrUpdate(poi);
    // reload????
});

type MoveResponse = {
    /** list of poi ids to delete */
    delete: string[];
    /** list of pois to add/update */
    fresh: POI[];
};
export async function sendMoveRequest(curr: SplitTileRegion, prev: SplitTileRegion) {
    const timestamps: Record<string, number> = {};

    const searchRects = curr.filter(tilereg => tilereg != undefined)
                            .map(tilereg => tilereg.area)

    for (const poi of pois.search(...searchRects)) {
        timestamps[poi._id] = poi.timestamp;
    }

    const response = await new Promise<MoveResponse>(
        (resolve, _) => {
            clientSocket.emit("move", { curr, prev, timestamps }, resolve);
        }
    );

    for (const _id of response.delete) {
        pois.remove(_id);
    }
    for (const poi of response.fresh) {
        pois.addOrUpdate(poi);
    }
}


export function fetchPost(id: string) {
    return fetch(path.join(SERVER_URL, "posts", id));
}

export async function sendPostRequest(pos: [number, number], body: string) {
    const resp = await fetch(path.join(SERVER_URL, "posts"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pos, body }),
    });

    if (!resp.ok) return;
    
    const { _id, timestamp } = await resp.json();
    pois.addOrUpdate({ _id, pos, variant: "post", timestamp });
}