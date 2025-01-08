"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import Map from "./components/map/map";

export default function App() {
    return (
        <APIProvider apiKey="AIzaSyCgfo_mjq90b6syVuWL2QbJbKwAqll9ceE">
            <Map />
        </APIProvider>
    );
}
