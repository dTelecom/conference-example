import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt_decode from "jwt-decode";
import { getWsUrl } from "@/lib/getWsUrl";
import { JwtKey } from "@/lib";

const { RoomServiceClient } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  method: z.enum(["kick", "mute"]),
  participantIdentity: z.string(),
  room: z.string(),
  trackSid: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const jwt = jwt_decode<JwtKey>(authorization);

    if (!jwt.video.roomAdmin) {
      return NextResponse.json("Forbidden", { status: 403 });
    }

    let url = await getWsUrl(req);
    url = url.replace("wss:", "https:");
    const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);

    svc.authHeader({
      room: input.room,
      roomAdmin: true,
    });

    switch (input.method) {
      case "kick":
        await svc.removeParticipant(input.room, input.participantIdentity);
        break;
      case "mute":
        if (input.trackSid) {
          await svc.mutePublishedTrack(input.room, input.participantIdentity, input.trackSid, true);
        }
        break;
    }

    return NextResponse.json("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 400 });
  }
}
