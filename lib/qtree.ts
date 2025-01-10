import { envelops, Rect } from "./area";
import { POI } from "./post";

/** adjacent and corner-touching rects are considered intersecting */
function intersects(a: Rect, b: Rect) {
    return (
        Math.max(a.left, b.left) <= Math.min(a.right, b.right) &&
        Math.max(a.bottom, b.bottom) <= Math.min(a.top, b.top)
    );
}

function withinInclusiveSW(point: [number, number], rect: Rect) {
    return (
        point[0] >= rect.left &&
        point[0] < rect.right &&
        point[1] >= rect.bottom &&
        point[1] < rect.top
    );
}
function withinInclusiveAll(point: [number, number], rect: Rect) {
    return (
        point[0] >= rect.left &&
        point[0] <= rect.right &&
        point[1] >= rect.bottom &&
        point[1] <= rect.top
    );
}

class QNode {
    static readonly MAX_LOAD: number = 10;

    children?: [QNode, QNode, QNode, QNode];

    bound: Rect;

    data?: POI[];

    size: number;

    constructor(bound: Rect) {
        this.bound = bound;
        this.data = [];
        this.size = 0;
    }

    search(query: Rect, res: POI[]) {
        if (!intersects(query, this.bound)) return;

        if (this.children) {
            this.children[0].search(query, res);
            this.children[1].search(query, res);
            this.children[2].search(query, res);
            this.children[3].search(query, res);
        } else {
            for (const d of this.data!) {
                if (withinInclusiveAll(d.pos, query)) res.push(d);
            }
        }
    }

    add(value: POI) {
        if (!withinInclusiveSW(value.pos, this.bound)) return;

        this.size++;

        // node is not a leaf node
        if (this.children) {
            this.children[0].add(value);
            this.children[1].add(value);
            this.children[2].add(value);
            this.children[3].add(value);
        }

        // node is a leaf node
        else {
            this.data!.push(value);

            // node is at max load
            if (this.data!.length == QNode.MAX_LOAD) {
                const midX = (this.bound.right - this.bound.left) / 2;
                const midY = (this.bound.top - this.bound.bottom) / 2;

                // 0 1
                // 2 3
                this.children = [
                    new QNode({
                        top: this.bound.top,
                        bottom: midY,
                        left: this.bound.left,
                        right: midX,
                    }),
                    new QNode({
                        top: this.bound.top,
                        bottom: midY,
                        left: midX,
                        right: this.bound.right,
                    }),
                    new QNode({
                        top: midX,
                        bottom: this.bound.bottom,
                        left: this.bound.left,
                        right: midX,
                    }),
                    new QNode({
                        top: midX,
                        bottom: this.bound.bottom,
                        left: midX,
                        right: this.bound.right,
                    }),
                ];

                for (const d of this.data!) {
                    if (d.pos[0] < midX) {
                        if (d.pos[1] < midY) this.children[2].data?.push(d);
                        else this.children[0].data?.push(d);
                    } else {
                        if (d.pos[1] < midY) this.children[3].data?.push(d);
                        else this.children[1].data?.push(d);
                    }
                }

                delete this.data;
            }
        }
    }

    /** returns `true` if value successfully removed */
    remove(value: POI) {
        if (!withinInclusiveSW(value.pos, this.bound)) return false;

        // node is not a leaf node
        if (this.children) {
            if (
                this.children[0].remove(value) ||
                this.children[1].remove(value) ||
                this.children[2].remove(value) ||
                this.children[3].remove(value)
            ) {
                this.size--;
                return true;
            }

            return false;
        }

        // node is a leaf node
        else {
            const i = this.data!.findIndex((POI) => POI._id === value._id);
            if (i == -1) return false;

            this.data?.splice(i, 1);
            this.size--;
            return true;
        }
    }
}

export default class QTree {
    private root: QNode;

    constructor(bound: Rect) {
        this.root = new QNode(bound);
    }

    add(value: POI) {
        this.root.add(value);
    }

    /** bounds are inclusive */
    search(...queries: Rect[]) {
        const res: POI[] = [];

        for (const query of queries) {
            if (!intersects(this.root.bound, query)) 
                continue;

            this.root.search(query, res);
        }

        return res;
    }

    /** returns `true` if value successfully removed */
    remove(value: POI) {
        return this.root.remove(value);
    }

    public get size() {
        return this.root.size;
    }
}