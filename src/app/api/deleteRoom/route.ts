import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const { RoomServiceClient } = require("@dtelecom/server-sdk-js");
import jwt_decode from "jwt-decode";
import { JwtKey, roomParticipants } from "@/lib";
import { getWsUrl } from "@/lib/getWsUrl";

const schema = z.object({
  slug: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = schema.parse(body);

    const authorization = req.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const jwt = jwt_decode<JwtKey>(authorization);

    if (!jwt.video.roomAdmin) {
      return NextResponse.json("Forbidden", { status: 403 });
    }

    let url = roomParticipants[slug]?.adminWsUrl || await getWsUrl(req);

    if (roomParticipants[slug]) {
      delete roomParticipants[slug];
    }

    url = url.replace("wss:", "https:");
    const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);

    svc.authHeader({
      room: slug,
      roomAdmin: true,
    });

    await svc.deleteRoom(slug).catch((e: Error) => {
      console.error("Error deleting room:", e, 'url:', url, 'slug:', slug);
      return NextResponse.json("Error deleting room", { status: 500 });
    });

    return NextResponse.json("ok", { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json("Bad Request", { status: 400 });
  }
}
