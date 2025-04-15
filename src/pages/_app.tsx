import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";
import type { AppProps } from "next/app";
import useInviteCode, { getInviteCode, setInviteCode } from "@/lib/hooks/useInviteCode";
import { AuthProvider } from "@/lib/dtel-auth/components";

const MyApp = ({
  Component,
  pageProps
}: AppProps) => {
  return (
    <>
      <Head>
        <title>dMeet | Web3 Meeting App</title>
      </Head>

      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </>
  );
};

const AppWrapper = ({ children }: PropsWithChildren) => {
  useInviteCode();

  return (
    <AuthProvider>
      <ThemeProvider forcedTheme={"dark"}>
        <main data-lk-theme="default">{children}</main>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default MyApp;
