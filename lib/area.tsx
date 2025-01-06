export type Rect = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export function envelops(larger: Rect, smaller: Rect) {
    return (
        larger.top >= smaller.top &&
        larger.bottom <= smaller.bottom &&
        larger.left <= smaller.left &&
        larger.right >= smaller.right
    );
}

export const BOUND = 180;

export function roundUp(n: number, size: number) {
    return Math.ceil(n / size) * size;
}
export function roundDown(n: number, size: number) {
    return Math.floor(n / size) * size;
}

export type TileRegion = {
    depth: number;
    area: Rect;
};
export function isEqual(a: TileRegion | undefined, b: TileRegion | undefined) {
    if (!a && !b) return true;
    if (!a || !b) return false;

    if (a.depth != b.depth) return false;

    return (
        a.area.top == b.area.top &&
        a.area.bottom == b.area.bottom &&
        a.area.left == b.area.left &&
        a.area.right == b.area.right
    );
}

export function getTileRegion(view: Rect): TileRegion {
    const viewSize =
        Math.max(view.right - view.left, view.top - view.bottom) * 2;

    let depth = 0;
    let tileSize = BOUND;

    while (tileSize > viewSize) {
        depth++;
        tileSize /= 2;
    }

    return {
        depth,
        area: {
            top: roundUp(view.top, tileSize),
            bottom: roundDown(view.bottom, tileSize),
            left: roundDown(view.left, tileSize),
            right: roundUp(view.right, tileSize),
        },
    };
}
