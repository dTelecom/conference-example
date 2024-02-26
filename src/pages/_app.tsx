import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import React from "react";
import MagicProvider from "@/components/magic/MagicProvider";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) => {
  return (
    <>
      <Head>
        <title>Web3 Meeting | dTelecom Cloud</title>
      </Head>

      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <MagicProvider>
          <ThemeProvider forcedTheme={"dark"}>
            <main data-lk-theme="default">
              <Component {...pageProps} />
            </main>
          </ThemeProvider>
        </MagicProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
