import { NextRequest, NextResponse } from "next/server";
import { roomParticipants, RoomSettings, roomSettings } from "@/lib";
import { defaultRoomSettings } from "@/lib/roomSettings";

export interface IGetRoomResponse {
  participantsCount: number;
  settings: RoomSettings;
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
    settings: roomSettings[slug] || defaultRoomSettings,
  };

  return NextResponse.json(data, { status: 200 });
}
