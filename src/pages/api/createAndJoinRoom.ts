import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import { env } from "@/env.mjs";
import requestIp from "request-ip";
import { getUserIdFromHeaders } from "@/lib/dtel-auth/server";
import { formatUserId } from "@/lib/dtel-auth/helpers";

const { AccessToken } = require("@dtelecom/server-sdk-js");

const schema = z.object({
  roomName: z.string().min(3),
  name: z.string().min(1),
  wsUrl: z.string().optional()
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const userId = await getUserIdFromHeaders(req);
  const formattedUserId = formatUserId(userId);

  const identity = formattedUserId || generateUUID();
  const slug = generateUUID();
  const { name, roomName, wsUrl } = req.body;

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
      roomAdmin: true
    })

  token.metadata = JSON.stringify({ admin: false });

  token.webHookURL = process.env.NEXT_PUBLIC_POINTS_BACKEND_URL
    ? `https://${process.env.NEXT_PUBLIC_POINTS_BACKEND_URL}/api/webhook`
    : undefined;

  const clientIp = requestIp.getClientIp(req) || undefined;
  const url = wsUrl || await token.getWsUrl(clientIp);

  res.status(200).json({
    url,
    token: token.toJwt(),
    slug,
    roomName: roomName,
    isAdmin: true,
  });
}
