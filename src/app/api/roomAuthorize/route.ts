import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import jwt_decode from "jwt-decode";

const { AccessToken, VideoGrant } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  token: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = schema.parse(body);

    const userId = await getUserIdFromHeaders(req);
    const formattedUserId = formatUserId(userId);

    const identity = formattedUserId || generateUUID();
    const { token: oldToken } = parsedBody;

    const jwt = jwt_decode<{
      name: string,
      video: typeof VideoGrant
    }>(oldToken);

    const token = new AccessToken(env.API_KEY, env.API_SECRET, {
      identity: identity,
      name: jwt.name as string
    });

    token.addGrant(jwt.video);

    token.metadata = JSON.stringify({ admin: jwt.video.roomAdmin, project: process.env.PROJECT_NAME });

    token.webHookURL = userId && process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
      ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
      : undefined;

    return NextResponse.json({
      token: token.toJwt()
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Invalid request or server error" },
      { status: 400 }
    );
  }
}
