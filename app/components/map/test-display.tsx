import { Polygon } from "./polygon";
import { SplitRect, toSplitRect, toSplitTileRegion } from "@/lib/area";

function getPolygonsOfSplitRect(splitRect: SplitRect) {
    return splitRect.map((rect, i) =>
        rect ? (
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
        ) : null
    );
}

type Props = {
    view: SplitRect;
};
export default function TestDisplay({ view }: Props) {
    return (
        <>
            {/* view */}
            {view && getPolygonsOfSplitRect(view)}

            {/* snapped view */}
            {view &&
                getPolygonsOfSplitRect(toSplitRect(toSplitTileRegion(view)))}
        </>
    );
}
