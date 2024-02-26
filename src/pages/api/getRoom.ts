import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  slug: z.string(),
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export interface IGetRoomResponse {
  slug: string;
  roomName: string;
  participantsCount?: number;
  roomDeleted: boolean;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  let room = null;
  let participantsCount = 0;

  if (prisma) {
    room = await prisma?.room.findFirst({
      where: {
        slug: slug as string,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    participantsCount = room.participantCount;
  }

  res.status(200).json({
    slug,
    roomName: room?.name || "",
    roomDeleted: room?.deleted,
    participantsCount,
  });
}
