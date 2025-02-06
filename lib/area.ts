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

export function splitTileRegionsEqual(a: SplitTileRegion, b: SplitTileRegion) {
    return tileRegionsEqual(a[0], b[0]) && tileRegionsEqual(a[1], b[1]);
}
export function tileRegionsEqual(a: TileRegion | undefined, b: TileRegion | undefined) {
    if (!a && !b) return true;
    if (!a || !b) return false;

    return a.depth == b.depth && rectsEqual(a.area, b.area);
}
export function rectsEqual(a: Rect, b: Rect) {
    return (
        a.top == b.top &&
        a.bottom == b.bottom &&
        a.left == b.left &&
        a.right == b.right
    );
}

export function getTileRegion(view: Rect): TileRegion {
    const viewSize =
        Math.max(view.right - view.left, view.top - view.bottom);

    let depth = 0;
    let tileSize = BOUND * 2;

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

export function pxToDegrees(map: google.maps.Map, px: number) {
    const mapWidthDegrees =
        map.getBounds()!.getNorthEast().lng() -
        map.getBounds()!.getSouthWest().lng();

    return (px * mapWidthDegrees) / map.getDiv().clientWidth;
}


export type SplitRect = [Rect?, Rect?];
export type SplitTileRegion = [TileRegion?, TileRegion?];

export function toSplitTileRegion(splitRect: SplitRect): SplitTileRegion {
    return [
        splitRect[0] && getTileRegion(splitRect[0]),
        splitRect[1] && getTileRegion(splitRect[1]),
    ];
}
export function toSplitRect(splitTileRegion: SplitTileRegion): SplitRect {
    return [splitTileRegion[0]?.area, splitTileRegion[1]?.area];
}
export function isSplit(rect: SplitRect) {
    return rect[1] != undefined;
}

export function split(rect: Rect): SplitRect {
    return rect.right < rect.left
        ? [
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: 180,
              },
              {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: -180,
                  right: rect.right,
              },
          ]
        : [rect, undefined];
}