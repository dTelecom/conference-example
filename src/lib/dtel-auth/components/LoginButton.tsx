import { usePrivy } from "@privy-io/react-auth";
import styles from "./LoginButton.module.css";
import WalletIcon from "../assets/wallet.svg";
import { UserPill } from "@privy-io/react-auth/ui";
import React from "react";
import { isMobileBrowser } from "@dtelecom/components-core";

type LoginButtonProps = {
  fullTitle?: boolean;
}

export const LoginButton = ({fullTitle}: LoginButtonProps) => {
  const { authenticated } = usePrivy();
  const isMobile = React.useMemo(() => isMobileBrowser(), []);

  if (!process.env.NEXT_PUBLIC_POINTS_BACKEND_URL) {
    return null;
  }

  return <div className={styles.button}>
    <UserPill
      label={authenticated || (!fullTitle && isMobile) ?
        <WalletIcon /> : <>
          <WalletIcon />Connect</>}
      ui={{
        background: "accent"
      }}
      size={2}
    />
  </div>;
};
