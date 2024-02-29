import { AccessToken } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import prisma from "@/lib/prisma";
import { env } from "@/env.mjs";
import requestIp from "request-ip";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { User } from "@prisma/client";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  identity: z.string().optional(),
  isAdmin: z.boolean().optional(),
  wsUrl: z.string().optional(),
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
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const input = req.body;
  const session = await getServerSession(req, res, authOptions);
  const identity = input.identity || generateUUID();

  let isAdmin = false;
  let adminId = null;
  let room = null;

  if (prisma) {
    room = await prisma.room.findFirst({
      where: {
        slug: input.slug,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    if (input.identity) {
      const admin = await prisma?.participant.findFirst({
        where: {
          identity: input.identity,
        },
      });

      if (admin?.id === room.adminId) {
        isAdmin = true;
        adminId = admin.id;
      }
    }
  }

  const token = new AccessToken(env.API_KEY, env.API_SECRET, {
    identity: identity,
    name: input.name,
  });

  token.addGrant({
    room: input.slug,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    roomAdmin: isAdmin,
  });
  console.log(
    "webhook",
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/webhook`
      : undefined
  );
  token.webHookURL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/webhook`
    : undefined;

  let url = input.wsUrl;

  if (!url) {
    const clientIp = requestIp.getClientIp(req) || undefined;
    url = await token.getWsUrl(clientIp);
  }

  if (prisma && room) {
    let user: User | null = null;
    if (session?.address) {
      user = await prisma.user.findFirst({
        where: {
          wallet: session.address,
        },
      });
    }

    if (!adminId) {
      await prisma?.participant.create({
        data: {
          identity,
          name: input.name,
          roomId: room.id,
          server: url,
          userId: user?.id,
        },
      });
    } else {
      await prisma?.participant.update({
        where: {
          id: adminId,
        },
        data: {
          server: url,
          name: input.name,
          userId: user?.id,
        },
      });
    }
  }

  res.status(200).json({
    identity,
    url,
    token: token.toJwt(),
    slug: input.slug,
    roomName: room?.name || "",
    isAdmin,
  });
}
