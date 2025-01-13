import Map from "./components/map/map";
import PostPosContextProvider from "./components/post/post-pos-context-provider";
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
                    <Map />
                    {children}
                </PostPosContextProvider>
            </body>
        </html>
    );
}
