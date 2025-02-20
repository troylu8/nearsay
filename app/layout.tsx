import GeolocationContextProvider from "./contexts/geolocation-provider";
import PostPosContextProvider from "./contexts/post-pos-provider";
import { NotificationsContextProvider } from "./contexts/notifications-provider";
import "./globals.css";
import Map from "./components/map/map";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <PostPosContextProvider>
                    <GeolocationContextProvider>
                        <NotificationsContextProvider>
                            <Map />
                            {children}
                        </NotificationsContextProvider>
                    </GeolocationContextProvider>
                </PostPosContextProvider>
            </body>
        </html>
    );
}
