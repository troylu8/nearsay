import { ViewShiftData } from "./markers";
import { Polygon } from "./polygon";
import { SplitRect } from "@/lib/area";

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

type TestProps = {
    view: SplitRect;
    viewShiftData: ViewShiftData | null;
}
export default function TestDisplay({ view, viewShiftData }: TestProps) {
    return (
        <>
            {/* view */}
            {view && getPolygonsOfSplitRect(view)}

            {/* snapped view */}
            {viewShiftData &&
                getPolygonsOfSplitRect(viewShiftData.view)}
        </>
    );
}