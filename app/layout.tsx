import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SERA — Smart Emergency Response",
  description: "One tap to send your location to emergency contacts.",
  manifest: "/manifest.json",
  themeColor: "#ff3b3b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SERA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
