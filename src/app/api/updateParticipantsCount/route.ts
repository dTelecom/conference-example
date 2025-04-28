import { NextRequest, NextResponse } from "next/server";
  import { JwtKey, roomParticipants } from "@/lib";
  import { z } from "zod";
  import jwt_decode from "jwt-decode";

  const schema = z.object({
    slug: z.string(),
    participantsCount: z.number().optional(),
  });

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const parsedBody = schema.parse(body);

      const authorization = req.headers.get("authorization");
      if (!authorization) {
        return NextResponse.json("Unauthorized", { status: 401 });
      }

      const jwt = jwt_decode<JwtKey>(authorization);

      if (!jwt.video.roomAdmin) {
        return NextResponse.json("Forbidden", { status: 403 });
      }

      const { slug, participantsCount } = parsedBody;

      const maxCount = 9999;
      const count = Math.min(participantsCount || 0, maxCount);

      if (roomParticipants[slug]) {
        roomParticipants[slug].count = count;
      }

      roomParticipants[slug].count = count;

      return NextResponse.json("ok", { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({}, { status: 400 });
    }
  }
