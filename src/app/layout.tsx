import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

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
import { SoundProvider } from "@/context/SoundContext";

import { PostHogProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-cyber-dark`}
      >
        <PostHogProvider>
          <SystemUIProvider>
            <SoundProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </SoundProvider>
          </SystemUIProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
