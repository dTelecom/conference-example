import { usePrivy } from "@privy-io/react-auth";
import { PropsWithChildren } from "react";

export const IsAuthorizedWrapper = ({children}: PropsWithChildren) => {
  const {authenticated, user} = usePrivy();

  if (!authenticated || !process.env.NEXT_PUBLIC_POINTS_BACKEND_URL) {
    return null;
  }

  return children;
}
