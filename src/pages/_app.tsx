import "@rainbow-me/rainbowkit/styles.css";
import "@dtelecom/components-styles";
import "@dtelecom/components-styles/prefabs";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";
import {
  getCsrfToken,
  SessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";
import {
  MagicAuthConnector,
  // UniversalWalletConnector,
} from "@magiclabs/wagmi-connector";
import {
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  configureChains,
  createConfig,
  useAccount,
  useDisconnect,
  useNetwork,
  useSignMessage,
  WagmiConfig,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { publicProvider } from "wagmi/providers/public";
import { mainnet } from "viem/chains";
import type { Chain } from "@wagmi/core";
import { SiweMessage } from "siwe";
import { infuraProvider } from "wagmi/providers/infura";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [
    infuraProvider({
      apiKey: process.env.NEXT_PUBLIC_WEB3_PROVIDER_FRONTEND_KEY as string,
    }),
    publicProvider(),
  ]
);

export const rainbowMagicConnector = ({ chains }: { chains: Chain[] }) => ({
  id: "magic",
  name: "Magic",
  iconUrl: "https://svgshare.com/i/pXA.svg",
  iconBackground: "#fff",
  createConnector: () => {
    const connector = new MagicAuthConnector({
      chains,
      options: {
        apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
        oauthOptions: {
          providers: ["facebook", "google", "twitter"],
          // callbackUrl: "https://your-callback-url.com" //optional
        },
        accentColor: "#59E970",
        isDarkMode: true,
      },
    });
    return {
      connector,
    };
  },
});

export const hasWallets =
  !!process.env.NEXT_PUBLIC_MAGIC_API_KEY ||
  process.env.NEXT_PUBLIC_WALLET_CONNECT_CLOUD_PROJECT_ID;

const walletList = [];
if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
  walletList.push({
    groupName: "Recommended",
    wallets: [rainbowMagicConnector({ chains })],
  });
}

if (process.env.NEXT_PUBLIC_WALLET_CONNECT_CLOUD_PROJECT_ID) {
  walletList.push(
    ...getDefaultWallets({
      chains,
      appName: "Wagmi",
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_CLOUD_PROJECT_ID,
    }).wallets
  );
}

const connectors =
  walletList.length > 0 ? connectorsForWallets(walletList) : [];

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const queryClient = new QueryClient();
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

      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            chains={chains}
            theme={darkTheme({
              accentColor: "#59E970",
              accentColorForeground: "black",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "large",
            })}
          >
            <SessionProvider session={pageProps.session} refetchInterval={0}>
              <AppWrapper>
                <Component {...pageProps} />
              </AppWrapper>
            </SessionProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiConfig>
    </>
  );
};

const AppWrapper = ({ children }: PropsWithChildren) => {
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { status } = useSession();
  const { disconnect } = useDisconnect();

  const handleLogin = async () => {
    try {
      const callbackUrl = "/protected";
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      }).catch(() => {
        void disconnect();
      });
      void signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  useEffect(() => {
    if (isConnected && status === "unauthenticated") {
      void handleLogin();
    } else if (!isConnected && status === "authenticated") {
      void signOut();
    }
  }, [isConnected, status]);

  return (
    <ThemeProvider forcedTheme={"dark"}>
      <main data-lk-theme="default">{children}</main>
    </ThemeProvider>
  );
};

export default MyApp;
