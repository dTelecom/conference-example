export const dynamic = "force-dynamic";

import { Metadata } from "next";
import DynamicAppWrapper from "@/components/DynamicAppWrapper";
import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://dmeet.org'),
  title: "dMeet | Web3 Meeting App",
  description: "dMeet is a free, open-source web app for audio/video conferences with a built-in Al translator. Create meetings, Invite friends, & Earn points. Powered by dTelecom.",
  openGraph: {
    title: "dMeet | Web3 Meeting App",
    description: "dMeet is a free, open-source web app for audio/video conferences with a built-in Al translator. Create meetings, Invite friends, & Earn points. Powered by dTelecom.",
    siteName: "dMeet | Web3 Meeting App",
    images: ["/og.png"]
  },
  viewport: {
    width: "device-width",
    initialScale: 1
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <DynamicAppWrapper>
      {children}
    </DynamicAppWrapper>
    </body>
    </html>
  );
}
