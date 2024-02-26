import { useMagic } from "../MagicProvider";
import { RPCError, RPCErrorCode } from "magic-sdk";
import { useState } from "react";
import { Button } from "@/components/ui";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Loader } from "lucide-react";
import styles from "./EmailOTP.module.scss";
import { Input } from "@/components/ui/Input/Input";
import { UserIcon } from "@/assets";

const EmailOTP = () => {
  const router = useRouter();
  const { status } = useSession();
  const { magic } = useMagic();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const [error, setError] = useState<string>();
  const [showForm, setShowForm] = useState(false);

  const showError = (toast: { message: string; type: string }) => {
    setError(toast.message);
    setTimeout(() => setError(""), 5000);
  };
  const handleLogin = async () => {
    if (
      !email.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
    ) {
      setEmailError(true);
    } else {
      try {
        setLoginInProgress(true);
        setEmailError(false);
        const didToken = await magic?.auth.loginWithEmailOTP({ email });

        const metadata = await magic?.user.getMetadata();

        if (!didToken || !metadata?.publicAddress) {
          throw new Error("Magic login failed");
        }

        await signIn("credentials", {
          didToken,
          callbackUrl: router.query["callbackUrl"] as string,
        });
        setEmail("");
      } catch (e) {
        console.log("login error: " + JSON.stringify(e));
        if (e instanceof RPCError) {
          switch (e.code) {
            case RPCErrorCode.MagicLinkFailedVerification:
            case RPCErrorCode.MagicLinkExpired:
            case RPCErrorCode.MagicLinkRateLimited:
            case RPCErrorCode.UserAlreadyLoggedIn:
              showError({ message: e.message, type: "error" });
              break;
            default:
              showError({
                message: "Something went wrong. Please try again",
                type: "error",
              });
          }
        }
      } finally {
        setLoginInProgress(false);
      }
    }
  };

  const handleShowUI = async () => {
    try {
      await magic?.wallet.showUI();
    } catch (error) {
      console.error("handleShowUI:", error);
      void signOut();
    }
  };

  if (status === "authenticated") {
    return (
      <Button
        style={{ marginLeft: "8px", padding: "8px", height: "auto" }}
        size={"sm"}
        onClick={() => void handleShowUI()}
      >
        <UserIcon />
      </Button>
    );
  }

  if (status === "unauthenticated" && !showForm) {
    return (
      <Button
        style={{ marginLeft: "8px" }}
        size={"sm"}
        onClick={() => setShowForm(true)}
      >
        Log in / Sign up
      </Button>
    );
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setShowForm(false);
        }
      }}
      className={styles.modalWrapper}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
        className={styles.modalContainer}
      >
        <span className={styles.formHeader}>Email OTP Login</span>

        <Input
          setValue={setEmail}
          onChange={(e) => {
            if (emailError) setEmailError(false);
            setEmail(e.target.value);
          }}
          placeholder={"Email"}
          value={email}
        />

        {emailError && (
          <span className={styles.formError}>Enter a valid email</span>
        )}

        {error && <span className={styles.formError}>{error}</span>}

        <Button
          disabled={isLoginInProgress || email.length == 0}
          type={"submit"}
        >
          {isLoginInProgress ? <Loader /> : "Log in / Sign up"}
        </Button>
      </form>
    </div>
  );
};

export default EmailOTP;
