/* eslint-disable
     @typescript-eslint/no-unsafe-member-access,
     @typescript-eslint/no-unsafe-assignment,
     @typescript-eslint/no-var-requires,
     @typescript-eslint/no-unsafe-call
 */
import { getChainId, getNetworkUrl } from "@/utils/network";
import { OAuthExtension } from "@magic-ext/oauth";
import { Magic as MagicBase } from "magic-sdk";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

const { Web3 } = require("web3");

export type Magic = MagicBase<OAuthExtension[]>;

type MagicContextType = {
  magic: Magic | null;
  web3: typeof Web3 | null;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  web3: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [web3, setWeb3] = useState<typeof Web3 | null>(null);
  const { status } = useSession();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      const magic = new MagicBase(process.env.NEXT_PUBLIC_MAGIC_API_KEY, {
        network: {
          rpcUrl: getNetworkUrl(),
          chainId: getChainId(),
        },
        extensions: [new OAuthExtension()],
        useStorageCache: true,
      });
      magic.user.onUserLoggedOut((isLoggedOut: boolean) => {
        if (isLoggedOut) {
          void signOut();
        }
      });

      setMagic(magic);
      setWeb3(new Web3((magic as any).rpcProvider));
    }
  }, []);

  useEffect(() => {
    // onUserLoggedOut doesn't work
    const checkIfLoggedIn = async () => {
      const isLoggedIn = await magic?.user.isLoggedIn();
      if (isLoggedIn === false && status == "authenticated") {
        void signOut();
      }
    };
    void checkIfLoggedIn();
  }, [magic?.user, status]);

  const value = useMemo(() => {
    return {
      magic,
      web3,
    };
  }, [magic, web3]);

  return (
    <MagicContext.Provider value={value}>{children}</MagicContext.Provider>
  );
};

export default MagicProvider;
