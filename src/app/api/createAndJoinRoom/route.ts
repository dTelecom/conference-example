import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import { getClientIP } from '@/lib/getClientIp';

const { AccessToken } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  roomName: z.string().min(3),
  name: z.string().min(1),
  wsUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = schema.parse(body);

    const userId = await getUserIdFromHeaders(req);
    const formattedUserId = formatUserId(userId);

    const identity = formattedUserId || generateUUID();
    const slug = generateUUID();
    const { name, roomName, wsUrl } = parsedBody;

    const token = new AccessToken(env.API_KEY, env.API_SECRET, {
      identity: identity,
      name: name,
    });

    token.addGrant({
      room: slug,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      roomAdmin: true,
    });

    token.metadata = JSON.stringify({ admin: false });

    token.webHookURL = userId && process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
      ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
      : undefined;

    const clientIp = getClientIP(req) || undefined;
    const url = wsUrl || (await token.getWsUrl(clientIp));

    return NextResponse.json({
      url,
      token: token.toJwt(),
      slug,
      roomName: roomName,
      isAdmin: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request or server error" },
      { status: 400 }
    );
  }
}
