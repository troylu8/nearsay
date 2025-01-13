import { Polygon } from "./polygon";
import { SplitRect, SplitTileRegion } from "./map";

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
    tileRegionAreas: SplitRect;
};
export default function TestDisplay({ view, tileRegionAreas }: Props) {
    return (
        <>
            {/* view */}
            {view && getPolygonsOfSplitRect(view)}

            {/* snapped view */}
            {tileRegionAreas && getPolygonsOfSplitRect(tileRegionAreas)}
        </>
    );
}
