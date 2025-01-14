import { AdvancedMarker } from "@vis.gl/react-google-maps";

type Props = {
    pos: google.maps.LatLngLiteral;
};
export default function YouAreHereMarker({ pos }: Props) {
    return (
        <AdvancedMarker key="you are here" position={pos}>
            <div className="-translate-y-1/2 rounded-[50%] bg-red-600 text-white w-3 h-3 "></div>
        </AdvancedMarker>
    );
}
