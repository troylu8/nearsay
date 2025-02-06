import { io } from "socket.io-client";
import { SplitTileRegion } from "@/lib/area";
import path from "path";
import { POI, POIManager } from "./types";
import bcrypt from "bcryptjs";


export const pois = new POIManager();


const SERVER_URL = "https://troy-book.tail2138e6.ts.net:8443/";
const clientSocket = io(SERVER_URL);

async function emitAsync<ResponseType>(event: string, data: Record<string, any>) {
    return new Promise<ResponseType>((resolve, _) => clientSocket.emit(event, data, resolve));
}

clientSocket.on("new-poi", (poi: POI) => {
    console.log("received new poi event");
    pois.addOrUpdate(poi);
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
        timestamps[poi._id] = poi.timestamp;
    }

    const resp = await emitAsync<MoveResponse>("view-shift", { curr, prev, timestamps });

    for (const _id of resp.delete) {
        pois.remove(_id);
    }
    for (const poi of resp.fresh) {
        pois.addOrUpdate(poi);
    }
}


export function fetchPost(id: string) {
    return fetch(path.join(SERVER_URL, "posts", id));
}

export function sendPostEvent(pos: [number, number], body: string) {
    clientSocket.emit("post", { pos, body });
}

export async function sendNewUserRequest(username: string, password: string) {
    
    const userhash = await bcrypt.hash(password, 10);

    const resp = await fetch(path.join(SERVER_URL, "sign-up"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, userhash }),
    });
    if (!resp.ok) 
        throw new Error(resp.status == 409 ? "username taken" : "server error");

    localStorage.setItem("CSRF-TOKEN", resp.headers.get("CSRF-TOKEN")!);
}

export async function sendGetJWTRequest(username: string, password: string) {

    const userhash = await bcrypt.hash(password, 10);    

    const resp = await fetch(path.join(SERVER_URL, "sign-in"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, userhash }),
    });

    if (!resp.ok) {
        resp.status
    }
}