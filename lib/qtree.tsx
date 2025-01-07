import { Rect, roundDown } from "./area";
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
    search(query: Rect) {
        const res: POI[] = [];
        this.root.search(query, res);
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

export type Cluster = {
    pos: [number, number];
    size: number;
};
export function isCluster(obj: any) {
    return typeof obj.pos === "object" && typeof obj.size === "number";
}

function poiToCluster(poi: POI): Cluster {
    return {
        // make a copy of poi.pos, so that moving this cluster doesnt move the poi!
        pos: [...poi.pos],
        size: 1,
    };
}
function addToCluster(cluster: Cluster, other: POI | Cluster) {
    const cluster2 = isCluster(other)
        ? (other as Cluster)
        : poiToCluster(other as POI);

    cluster.pos[0] =
        (cluster.size * cluster.pos[0] + cluster2.size * cluster2.pos[0]) /
        (cluster.size + cluster2.size);
    cluster.pos[1] =
        (cluster.size * cluster.pos[1] + cluster2.size * cluster2.pos[1]) /
        (cluster.size + cluster2.size);

    cluster.size += cluster2.size;
}

export function cluster(
    pois: POI[],
    range: number,
    bound: Rect
): (POI | Cluster)[] {
    const grid: Record<string, POI | Cluster> = {};

    // sort pois into grid of clusters or pois
    for (const poi of pois) {
        const bucketPos = [
            roundDown(poi.pos[0] - bound.left, range),
            roundDown(poi.pos[1] - bound.bottom, range),
        ];
        const bucketName = bucketPos.join(",");

        const inhabitant = grid[bucketName];

        // nothing in this bucket
        if (!inhabitant) {
            grid[bucketName] = poi;
        }

        // there's a cluster in this bucket
        else if (isCluster(inhabitant)) {
            addToCluster(inhabitant as Cluster, poi);
        }

        // there's a poi in this bucket
        else {
            const cluster = poiToCluster(inhabitant as POI);
            addToCluster(cluster, poi);
            grid[bucketName] = cluster;
        }
    }

    // console.log(grid);

    const res: (POI | Cluster)[] = [];

    const bucketNames = Object.keys(grid);
    const unvisited = new Set(bucketNames);

    for (const bucketName of bucketNames) {
        const [x, y] = bucketName.split(",");
        const bucketPos: [number, number] = [Number(x), Number(y)];

        const finalItem: [Cluster | POI | null] = [null];

        clusterGridDFS(grid, range, bucketPos, finalItem, unvisited);

        if (finalItem[0]) res.push(finalItem[0]);
    }

    return res;
}

function clusterGridDFS(
    grid: Record<string, POI | Cluster>,
    range: number,
    bucketPos: [number, number],
    finalItem: [Cluster | POI | null],
    unvisited: Set<string>
) {
    const bucketName = bucketPos.join(",");

    if (!unvisited.has(bucketName)) return;
    unvisited.delete(bucketName);

    const inhabitant = grid[bucketName];

    // this is where dfs started
    if (!finalItem[0]) {
        finalItem[0] = inhabitant;
    }

    //  this is not the dfs' origin
    else {
        // if final item is not a cluster yet, make it one
        if (!isCluster(finalItem[0])) {
            finalItem[0] = poiToCluster(finalItem[0] as POI);
        }

        // add current item to final cluster
        addToCluster(finalItem[0] as Cluster, inhabitant);
    }

    const adj: [number, number][] = [
        [bucketPos[0] + range, bucketPos[1]],
        [bucketPos[0] - range, bucketPos[1]],
        [bucketPos[0], bucketPos[1] + range],
        [bucketPos[0], bucketPos[1] - range],
    ];

    for (const adjBucketPos of adj) {
        const adjBucketName = adjBucketPos.join(",");
        const adjInhabitant = grid[adjBucketName];

        if (adjInhabitant && dist(inhabitant.pos, adjInhabitant.pos) <= range) {
            clusterGridDFS(grid, range, adjBucketPos, finalItem, unvisited);
        }
    }
}
function dist(p1: [number, number], p2: [number, number]) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}
