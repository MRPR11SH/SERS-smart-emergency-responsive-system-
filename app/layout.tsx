import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "SERA — Smart Emergency Response App",
  description: "Next-generation AI-powered emergency response system. One tap to safety.",
  keywords: ["emergency", "safety", "response", "SOS", "smart", "AI"],
  openGraph: {
    title: "SERA — Smart Emergency Response App",
    description: "One tap to safety. AI-powered emergency response.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-grid noise">
        {/* Background glow orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="glow-orb absolute -top-40 -left-40 w-96 h-96 bg-blue-900 opacity-20" />
          <div className="glow-orb absolute top-1/3 -right-40 w-80 h-80 bg-red-900 opacity-15" />
          <div className="glow-orb absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-900 opacity-10" />
        </div>
        <ToastProvider>
          <div className="relative z-10">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
