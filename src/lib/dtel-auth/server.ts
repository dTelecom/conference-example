import { PrivyClient } from "@privy-io/server-auth";
import { NextApiRequest } from "next";

let privy: PrivyClient | null = null;

export const getUserIdFromHeaders = async (req: NextApiRequest) => {
  const authToken = req.cookies["privy-token"];

  if (!process.env.NEXT_PUBLIC_POINTS_BACKEND_URL) {
    return null;
  } else if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
    throw new Error("Privy app ID and secret are not set");
  } else if (!privy) {
    privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID, process.env.PRIVY_APP_SECRET);
  }

  try {
    if (!authToken) {
      throw new Error("No Authorization header found");
    }

    const verifiedClaims = await privy.verifyAuthToken(authToken);
    return verifiedClaims.userId;
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`);
    return null;
  }
};
