import { Rect } from "@/lib/area";
import { Polygon } from "./polygon";
import { isSplit } from "./map";

function getPolygonsOfPossiblySplitRect(rect: Rect | [Rect, Rect]) {
    const rects = isSplit(rect) ? (rect as [Rect, Rect]) : [rect as Rect];
    return rects.map((rect, i) => (
        <Polygon
            key={i}
            paths={[
                [
                    {
                        lng: rect.left,
                        lat: rect.top,
                    },
                    {
                        lng: rect.right,
                        lat: rect.top,
                    },
                    {
                        lng: rect.right,
                        lat: rect.bottom,
                    },
                    {
                        lng: rect.left,
                        lat: rect.bottom,
                    },
                    {
                        lng: rect.left,
                        lat: rect.top,
                    },
                ],
            ]}
        />
    ));
}

type Props = {
    view: Rect | [Rect, Rect] | undefined;
    tileRegionArea: Rect | [Rect, Rect] | undefined;
};
export default function TestDisplay({ view }: Props) {
    return (
        <>
            {/* view */}
            {view && getPolygonsOfPossiblySplitRect(view)}

            {/* snapped view */}
            {/* {tileRegion && (
                <Polygon
                    paths={[
                        [
                            {
                                lng: tileRegion.area.left,
                                lat: tileRegion.area.top,
                            },
                            {
                                lng: tileRegion.area.right,
                                lat: tileRegion.area.top,
                            },
                            {
                                lng: tileRegion.area.right,
                                lat: tileRegion.area.bottom,
                            },
                            {
                                lng: tileRegion.area.left,
                                lat: tileRegion.area.bottom,
                            },
                            {
                                lng: tileRegion.area.left,
                                lat: tileRegion.area.top,
                            },
                        ],
                    ]}
                />
            )} */}
        </>
    );
}
