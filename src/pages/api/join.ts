import type { Room } from "@dtelecom/server-sdk-js";
import { AccessToken, RoomServiceClient } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import { generateUUID } from "@/lib/client-utils";
import prisma from "@/lib/prisma";
import { env } from "@/env.mjs";
import requestIp from "request-ip";

const schema = z.object({
  slug: z.string(),
  name: z.string().min(3),
  identity: z.string().optional()
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

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse
) {
  const input = req.body;

  const room = await prisma.room.findFirst({
    where: {
      slug: input.slug
    }
  });

  if (!room) {
    throw new Error("Room not found");
  }

  const identity = input.identity || generateUUID();

  let isAdmin = false;
  let adminId = null;
  if (input.identity) {
    const admin = await prisma.participant.findFirst({
      where: {
        identity: input.identity
      }
    });
    if (admin?.id === room.adminId) {
      isAdmin = true;
      adminId = admin.id;
    }
  }

  const token = new AccessToken(
    env.API_KEY,
    env.API_SECRET,
    { identity: identity, name: input.name }
  );

  token.addGrant({
    room: room.slug,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    roomAdmin: isAdmin
  });
  token.webHookURL = `${process.env.VERCEL_URL!}/api/webhook`;

  const ip = requestIp.getClientIp(req) || undefined;
  console.log(req.socket.localAddress, ip);
  const url = await token.getWsUrl(req.socket.localAddress, ip);

  if (!adminId) {
    await prisma.participant.create({
      data: {
        identity,
        name: input.name,
        roomId: room.id,
        server: url
      }
    });
  } else {
    await prisma.participant.update({
      where: {
        id: adminId
      },
      data: {
        server: url,
        name: input.name
      }
    });

    const svc = new RoomServiceClient(url.replace("wss:", "https:"), process.env.API_KEY, process.env.API_SECRET);
    // create a new room
    const opts = {
      name: room.slug,
      // timeout in seconds
      emptyTimeout: 10 * 60,
      maxParticipants: 20
    };
    const rooms = await svc.listRooms([input.slug]);

    if (rooms.length === 0) {
      await svc.createRoom(opts).then((value: Room) => {
        console.log("room created", value);
      });
    }
  }

  res.status(200).json({ identity, url, token: token.toJwt(), slug: room.slug, roomName: room.name, isAdmin });
}
