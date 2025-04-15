import React from 'react';
import { PrivyProvider } from "@privy-io/react-auth";
import {toSolanaWalletConnectors} from "@privy-io/react-auth/solana";

export function AuthProvider({children}: {children: React.ReactNode}) {
  if (!process.env.NEXT_PUBLIC_POINTS_BACKEND_URL) {
    return children;
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        appearance: {
          theme: "dark",
          accentColor: "#59E970"
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
