import { NextRequest, NextResponse } from "next/server";
import { roomParticipants } from "@/lib";

export interface IGetRoomResponse {
  participantsCount: number;
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const participantsCount = roomParticipants[slug]?.count || 0;

  const data = {
    slug,
    participantsCount,
  };

  return NextResponse.json(data, { status: 200 });
}
