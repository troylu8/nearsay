import { io } from "socket.io-client";
import { BOUND } from "./area";
import QTree from "./qtree";
import { SplitTileRegion } from "@/lib/area";

export type Pos = [number, number];

export type POI = {
    _id: string;
    pos: Pos;
    variant: "post";
    timestamp: number;
};

export type Post = {
    pos: Pos;
    body: string;
    likes: number;
    dislikes: number;
    expiry: number;
    views: number;
};

export const poisMap: Record<string, POI> = {};
export const poisTree = new QTree({
    left: -BOUND,
    right: BOUND,
    top: BOUND,
    bottom: -BOUND,
});

const clientSocket = io("https://troy-book.tail2138e6.ts.net:8443/");

type MoveResponse = {
    /** list of poi ids to delete */
    delete: string[];

    /** list of pois to add/update */
    fresh: POI[];
};

export async function sendMoveRequest(curr: SplitTileRegion, prev: SplitTileRegion) {
    const timestamps: Record<string, number> = {};

    const searchRects = curr.map(tilereg => tilereg? tilereg.area : undefined)
                            .filter(rect => rect != undefined);

    for (const poi of poisTree.search(...searchRects)) {
        timestamps[poi._id] = poi.timestamp;
    }

    const response = await new Promise<MoveResponse>(
        (resolve, _) => {
            clientSocket.emit("move", { curr, prev, timestamps }, resolve);
        }
    );

    for (const _id of response.delete) {
        poisTree.remove(poisMap[_id]);
        delete poisMap[_id];
    }
    for (const poi of response.fresh) {
        if (poisMap[poi._id]) {
            // update existing poi
            poisTree.remove(poisMap[poi._id]);
            poisTree.add(poi);
        } else {
            // add new poi
            poisTree.add(poi);
        }

        poisMap[poi._id] = poi;
    }
}
