import GeolocationContextProvider from "./contexts/geolocation-provider";
import PostPosContextProvider from "./contexts/post-pos-provider";
import { NotificationsContextProvider } from "./contexts/notifications-provider";
import "./globals.css";
import Map from "./components/map/map";
import AccountContextProvider from "./contexts/account-providers";
import SettingsContextProvider from "./contexts/present-provider";
import ChatContextProvider from "./contexts/chat-provider";
import Initialize from "./components/initialize";

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
                            <SettingsContextProvider>
                                <AccountContextProvider>
                                    <ChatContextProvider>
                                        <Initialize/>
                                        <Map />
                                        {children}
                                    </ChatContextProvider>
                                </AccountContextProvider>
                            </SettingsContextProvider>
                        </NotificationsContextProvider>
                    </GeolocationContextProvider>
                </PostPosContextProvider>
            </body>
        </html>
    );
}
