import GeolocationContextProvider from "./contexts/geolocation-context-provider";
import Map from "./components/map/map";
import PostPosContextProvider from "./contexts/post-pos-context-provider";
import { NotificationsContextProvider } from "./contexts/notifications-context-provider";
import "./globals.css";

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
