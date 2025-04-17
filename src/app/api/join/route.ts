import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import { formatUserId } from "@/lib/dtel-auth/helpers";
import { getClientIP } from '@/lib/getClientIp';

const { AccessToken } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  wsUrl: z.string().optional(),
  roomName: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, roomName, wsUrl } = body as z.infer<typeof schema>;

    const userId = await getUserIdFromHeaders(req);
    const formattedUserId = formatUserId(userId);

    const identity = formattedUserId || generateUUID();

    const token = new AccessToken(env.API_KEY, env.API_SECRET, {
      identity: identity,
      name: name,
    });

    token.addGrant({
      room: slug,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      roomAdmin: false,
    });

    token.metadata = JSON.stringify({ admin: false });

    token.webHookURL = process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
      ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
      : undefined;

    let url = wsUrl;

    if (!url) {
      const clientIp = getClientIP(req) || undefined;
      url = await token.getWsUrl(clientIp);
    }

    return NextResponse.json({
      identity,
      url,
      token: token.toJwt(),
      slug: slug,
      roomName: roomName,
      isAdmin: false,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
