import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { RoomServiceClient } from "@dtelecom/server-sdk-js";

const schema = z.object({
  slug: z.string()
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

  let participantsCount = 0;
  if (room.adminId) {
    const admin = await prisma.participant.findFirst({
      where: {
        id: room.adminId
      }
    });

    if (admin?.server) {
      const url = admin.server;
      const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);
      svc.authHeader({
        room: input.slug
      });

      const [first] = await svc.listRooms([input.slug]);
      participantsCount = first?.numParticipants || 0;
    }
  }


  res.status(200).json({ room, participantsCount });
}
