import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import requestIp from "request-ip";
import { formatUserId } from "@/lib/dtel-auth/helpers";

const { AccessToken } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  wsUrl: z.string().optional(),
  roomName: z.string().min(3)
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export interface IJoinResponse {
  identity: string;
  url: string;
  token: string;
  slug: string;
  roomName: string;
  isAdmin: boolean;
  language: string;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const userId = await getUserIdFromHeaders(req);
  const formattedUserId = formatUserId(userId);

  const identity = formattedUserId || generateUUID();

  const { name, slug, roomName, wsUrl } = req.body;

  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
    identity: identity,
    name: name
  });

  token
    .addGrant({
      room: slug,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      roomAdmin: false
    });

  token.metadata = JSON.stringify({ admin: false });

  token.webHookURL = process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
    ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
    : undefined;

  let url = wsUrl;

  if (!url) {
    const clientIp = requestIp.getClientIp(req) || undefined;
    url = await token.getWsUrl(clientIp);
  }

  res.status(200).json({
    identity,
    url,
    token: token.toJwt(),
    slug: slug,
    roomName: roomName,
    isAdmin: false
  });
}
