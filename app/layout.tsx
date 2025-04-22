import "./app.css";
import GeolocationContextProvider from "./contexts/geolocation-provider";
import PostPosContextProvider from "./contexts/post-pos-provider";
import { NotificationsContextProvider } from "./contexts/notifications-provider";
import Map from "./components/map/map";
import AccountContextProvider from "./contexts/account-providers";
import ChatContextProvider from "./contexts/chat-provider";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
    title: "nearsay",
    description: "A public message board and chatting app, displayed over a map of the earth.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <body>
                <PostPosContextProvider>
                    <GeolocationContextProvider>
                        <NotificationsContextProvider>
                                <AccountContextProvider>
                                    <ChatContextProvider>
                                        <Map />
                                        {children}
                                    </ChatContextProvider>
                                </AccountContextProvider>
                        </NotificationsContextProvider>
                    </GeolocationContextProvider>
                </PostPosContextProvider>
            </body>
        </html>
    );
}
