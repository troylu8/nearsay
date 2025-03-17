export type Rect = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export function within(rect: Rect, x: number, y: number) {
    return x >= rect.left && x <= rect.right && y >= rect.bottom && y <= rect.top;
}

export const BOUND = 180;

export function roundUp(n: number, size: number) {
    return Math.ceil(n / size) * size;
}
export function roundDown(n: number, size: number) {
    return Math.floor(n / size) * size;
}

export function rectsEqual(a: Rect, b: Rect) {
    return (
        a.top == b.top &&
        a.bottom == b.bottom &&
        a.left == b.left &&
        a.right == b.right
    );
}

export function alignToTiles(view: Rect): {layer: number, view: Rect} {
    const viewSize =
        Math.max(view.right - view.left, view.top - view.bottom);

    let layer = 0;
    let tileSize = BOUND * 2;
    while (tileSize > viewSize) {
        layer++;
        tileSize /= 2;
    }
    
    return {
        layer,
        view: {
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

export function pxToMeters(map: google.maps.Map, px: number) {

    
    const mapWidthDegrees =
        map.getBounds()!.getNorthEast().lng() -
        map.getBounds()!.getSouthWest().lng();
    
    const pxInDegrees = (px * mapWidthDegrees) / map.getDiv().clientWidth;

    return google.maps.geometry.spherical.computeDistanceBetween(
        { lat: 0, lng: 0 },
        { lat: 0, lng: pxInDegrees },
    );
}


export type SplitRect = [Rect | null, Rect | null];
export function withinSplitRect(splitRect: SplitRect, x: number, y: number) {
    return (splitRect[0] && within(splitRect[0], x, y)) || (splitRect[1] && within(splitRect[1], x, y));
}

export function splitRectsEqual(a: SplitRect, b: SplitRect) {
    return (
        ( !(a[0] || b[0]) ||  (a[0] && b[0] && rectsEqual(a[0], b[0])) ) &&
        ( !(a[1] || b[1]) ||  (a[1] && b[1] && rectsEqual(a[1], b[1])) )
    );
}

export function isSplit(rect: SplitRect) {
    return rect[1] != undefined;
}

export function addGap(view: SplitRect) {
    let gapW;
    let gapH;
    if (isSplit(view)) {
        const [a, b] = view as [Rect, Rect];
        gapW = (a.right - a.left + (b.right - b.left)) * 0.3;
        gapH = (a.top - a.bottom) * 0.3;

        if (a.right - a.left < gapW) {
            view[0] = null;
            b.top -= gapH;
            b.bottom += gapH;

            if (a.left == -180) {
                b.right = 180 - (gapW - (a.right - a.left));
                b.left += gapW;
            } else {
                b.left = -180 + (gapW - (a.right - a.left));
                b.right -= gapW;
            }
        } else if (b.right - b.left < gapW) {
            view[1] = null;
            a.top -= gapH;
            a.bottom += gapH;

            if (b.left == -180) {
                a.right = 180 - (gapW - (b.right - b.left));
                a.left += gapW;
            } else {
                a.left = -180 + (gapW - (b.right - b.left));
                a.right -= gapW;
            }
        } else {
            a.top -= gapH;
            b.top -= gapH;
            a.bottom += gapH;
            b.bottom += gapH;
            if (a.left == -180) a.right -= gapW;
            if (a.right == 180) a.left += gapW;
            if (b.left == -180) b.right -= gapW;
            if (b.right == 180) b.left += gapW;
        }
    } else {
        gapW = (view[0]!.right - view[0]!.left) * 0.3;
        gapH = (view[0]!.top - view[0]!.bottom) * 0.3;
        view[0]!.top -= gapH;
        view[0]!.bottom += gapH;
        view[0]!.left += gapW;
        view[0]!.right -= gapW;
    }
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
        : [rect, null];
}