import { useLogin, usePrivy } from "@privy-io/react-auth";
import styles from "./LoginButton.module.css";
import WalletIcon from "../assets/wallet.svg";
import { UserPill } from "@privy-io/react-auth/ui";

export const LoginButton = () => {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();

  if (!process.env.NEXT_PUBLIC_POINTS_BACKEND_URL) {
    return null;
  }

  if (!ready) {
    return null;
  }

  return <div className={styles.button}>
    <UserPill
      label={authenticated ?
        <WalletIcon /> : <>
          <WalletIcon />Connect</>}
      ui={{
        background: "accent"
      }}
      size={2}
    />
  </div>;
};
