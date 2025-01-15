import { Rect, roundDown } from "./area";
import { POI, Pos } from "./data";

export type Cluster = {
    pos: Pos;
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
): (POI | Cluster)[] {
    const grid: Record<string, POI | Cluster> = {};

    // sort pois into grid of clusters or pois
    for (const poi of pois) {
        const bucketPos = [
            roundDown(poi.pos[0], range),
            roundDown(poi.pos[1], range),
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

    const res: (POI | Cluster)[] = [];

    const bucketNames = Object.keys(grid);
    const unvisited = new Set(bucketNames);

    for (const bucketName of bucketNames) {
        const [x, y] = bucketName.split(",");
        const bucketPos: Pos = [Number(x), Number(y)];

        const finalItem: [Cluster | POI | null] = [null];

        clusterGridDFS(grid, range, bucketPos, finalItem, unvisited);

        if (finalItem[0]) res.push(finalItem[0]);
    }

    return res;
}

function clusterGridDFS(
    grid: Record<string, POI | Cluster>,
    range: number,
    bucketPos: Pos,
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

    const adj: Pos[] = [
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
function dist(p1: Pos, p2: Pos) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}
