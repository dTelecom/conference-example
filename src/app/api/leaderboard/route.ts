import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await getUserIdFromHeaders(req);
    const formattedUserId = formatUserId(userId);

    let clientResult: LeaderboardRecord[] = [];
    try {
      const response = await axios.post<LeaderboardRecord[]>(
        `${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/leaderboard` as string,
        {
          refCode: body.refCode,
          userId: formattedUserId,
        }
      );
      clientResult = response.data;
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }

    return NextResponse.json({
      result: clientResult,
      referralCode: formattedUserId,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}

export interface LeaderboardRecord {
  position: number;
  wallet?: string;
  points: number;
  isCurrentUser?: boolean;
}
