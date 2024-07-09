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
import type { Participant, User } from "@prisma/client";

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
  let identity = input.identity || generateUUID();

  let isAdmin = false;
  let adminId = null;
  let room = null;
  let currentUser: User | null = null;
  let adminParticipant: Partial<Participant> | null = null;

  if (prisma) {
    room = await prisma.room.findFirst({
      where: {
        slug: input.slug,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    if (session?.address) {
      currentUser = await prisma.user.findFirst({
        where: {
          wallet: session.address,
        },
      });
    }

    // check if authorized user had participant record
    if (currentUser) {
      const currentParticipant = await prisma.participant.findFirst({
        where: {
          roomId: room.id,
          userId: currentUser.id,
        },
      });

      if (currentParticipant?.identity) {
        identity = currentParticipant.identity;
      }
    }

    if (room.adminId) {
      adminParticipant = await prisma?.participant.findFirst({
        where: {
          id: room.adminId,
        },
        select: {
          id: true,
          user: true,
          identity: true,
        },
      });

      if (
        adminParticipant?.userId &&
        identity === adminParticipant?.identity &&
        !currentUser
      ) {
        throw new Error("unauthorized");
      } else if (input.identity === adminParticipant?.identity) {
        isAdmin = true;
        adminId = adminParticipant?.id;
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

  token.webHookURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/webhook`
    : undefined;

  let url = input.wsUrl;

  if (!url) {
    const clientIp = requestIp.getClientIp(req) || undefined;
    url = await token.getWsUrl(clientIp);
  }

  if (prisma && room) {
    if (!adminId) {
      await prisma?.participant.create({
        data: {
          identity,
          name: input.name,
          roomId: room.id,
          server: url,
          userId: currentUser?.id,
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
          userId: currentUser?.id,
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
