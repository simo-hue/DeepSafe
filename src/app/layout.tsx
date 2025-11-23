import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ["latin"], variable: '--font-orbitron' });

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Deepsafe",
  description: "Gamified AI Safety Education",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deepsafe",
  },
};

import { SystemUIProvider } from "@/context/SystemUIContext";
import { CyberToast } from "@/components/ui/CyberToast";
import { CyberModal } from "@/components/ui/CyberModal";

import { PostHogProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased pt-24 pb-24 bg-cyber-dark`}
      >
        <PostHogProvider>
          <SystemUIProvider>
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden">
              <Header />
              <main className="flex-1 p-4 z-10">
                {children}
              </main>
              <BottomNav />
              <CyberToast />
              <CyberModal />
            </div>
          </SystemUIProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
