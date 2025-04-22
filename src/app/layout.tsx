export const dynamic = "force-dynamic";

import { Metadata } from "next";
import DynamicAppWrapper from "@/components/DynamicAppWrapper";
import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const title = "dMeet | Web3 Meeting App";
const description = "Free, open-source web app for audio/video conferences with a built-in AI translator. Use the app, invite friends, and earn points. Powered by dTelecom.";
export const metadata: Metadata = {
  metadataBase: new URL("https://dmeet.org"),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    siteName: title,
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
