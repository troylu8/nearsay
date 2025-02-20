import MapInner from "./map-inner";

/**
 * env variables are only available in server components, 
 * and `<APIProvider/>` is only available in client components
 * 
 * 
 * this server component wrapper provides the api key to `<APIProvider/>`
 */
export default function Map() {
    return <MapInner apiKey={process.env.GOOGLE_MAPS_API_KEY!} />;
}