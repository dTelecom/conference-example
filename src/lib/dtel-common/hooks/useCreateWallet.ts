import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

export const useCreateWallet = () => {
  const { user } = usePrivy();
  const { createWallet, ready, wallets } = useSolanaWallets();

  const createSolanaWallet = async () => {
    try {
      await createWallet();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (user && ready && wallets.length === 0) {
      void createSolanaWallet();
    }
  }, [user, ready, wallets.length]);
};
