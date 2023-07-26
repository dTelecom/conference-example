import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import { type AppType } from "next/app";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import React from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>
          Web3 Meeting | dTelecom Cloud
        </title>
      </Head>

      <ThemeProvider forcedTheme={"dark"}>
        <main data-lk-theme="default">
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
