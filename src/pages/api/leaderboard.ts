import type { NextApiRequest, NextApiResponse } from "next";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdFromHeaders(req);
  const formattedUserId = formatUserId(userId);

  let clientResult: LeaderboardRecord[] = [];
  try {
    const response = await axios.post<LeaderboardRecord[]>(`${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/leaderboard` as string, {
      refCode: req.body.refCode,
      userId: formattedUserId
    })
    clientResult = response.data;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }

  return res.status(200).json({
    result: clientResult,
    referralCode: formattedUserId
  });
}

export interface LeaderboardRecord {
  position: number;
  wallet?: string;
  points: number;
  isCurrentUser?: boolean;
}
