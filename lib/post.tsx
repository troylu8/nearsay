import { BOUND, TileRegion } from "./area";
import { io } from "socket.io-client";
import QTree from "./qtree";

export type POI = {
    _id: string;
    pos: [number, number];
    variant: "post";
    data?: Post;
    timestamp: number;
};

export type Post = {
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

const clientSocket = io("http://localhost:5000");

type MoveResponse = {
    /** list of poi ids to delete */
    delete: string[];

    /** list of pois to add/update */
    fresh: POI[];
};

export async function sendMoveRequest(curr: TileRegion, prev?: TileRegion) {
    const timestamps: Record<string, number> = {};

    for (const poi of poisTree.search(curr.area)[0]) {
        timestamps[poi._id] = poi.timestamp;
    }

    const response = await new Promise<MoveResponse | null>(
        (resolve, reject) => {
            clientSocket.emit("move", { curr, prev, timestamps }, resolve);
        }
    );

    if (!response) return;

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
