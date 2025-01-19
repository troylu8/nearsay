import EventEmitter from "node:events";
import { BOUND, Rect } from "./area";
import QTree from "./qtree";

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

export class POIManager {
    private map: Record<string, POI> = {};
    private tree = new QTree({
        left: -BOUND,
        right: BOUND,
        top: BOUND,
        bottom: -BOUND,
    });

    private poisChangedHandlers: Set<() => any> = new Set();

    addOrUpdate(poi: POI) {
        const prev = this.map[poi._id];
        if (prev) this.tree.remove(prev);
        
        this.map[poi._id] = poi;
        this.tree.add(poi);

        for (const handler of this.poisChangedHandlers) 
            handler();
    }

    remove(_id: string) {
        if (this.tree.remove(this.map[_id])) {
            delete this.map[_id];
            for (const handler of this.poisChangedHandlers) 
                handler();
        }
    }

    search(...queries: Rect[]) {
        return this.tree.search(...queries);
    }

    addPoisChangedHandler(func: () => any) {
        this.poisChangedHandlers.add(func);
    }

    removePoisChangedHandler(func: () => any) {
        this.poisChangedHandlers.delete(func);
    }
}
export const pois = new POIManager();