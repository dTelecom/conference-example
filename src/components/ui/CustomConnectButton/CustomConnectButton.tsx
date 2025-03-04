import dynamic from 'next/dynamic';
import { ConnectButtonText } from "@/components/ui/ConnectButtonText";
import { Button } from "@/components/ui";
import { ChevronDown } from "@/assets";
import styles from "./CustomConnectButton.module.scss";

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false }
) as any;

export const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }: {
        account: { displayName: string };
        chain: { unsupported: boolean };
        openAccountModal: () => void;
        openChainModal: () => void;
        openConnectModal: () => void;
        authenticationStatus: string;
        mounted: boolean;
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    style={{
                      borderRadius: "10px",
                      height: "36px",
                    }}
                    size={"sm"}
                    onClick={openConnectModal}
                    type="button"
                  >
                    <ConnectButtonText />
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div onClick={openAccountModal} className={styles.walletButton}>
                  <button type="button">{account.displayName}</button>
                  <div className={styles.divider} />
                  <ChevronDown />
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
