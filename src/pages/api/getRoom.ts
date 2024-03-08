import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { Participant } from "@prisma/client";

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
  referralCode: string | null;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  const session = await getServerSession(req, res, authOptions);

  let room = null;
  let participantsCount = 0;
  let adminParticipant: Partial<Participant> | null = null;
  let referralCode: string | null = null;

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

    if (!session?.address && room.adminId) {
      adminParticipant = await prisma?.participant.findFirst({
        where: {
          id: room.adminId,
        },
        select: {
          id: true,
          userId: true,
        },
      });
    }

    // pass referralCode of admin to unauthorized participant
    if (adminParticipant?.userId) {
      referralCode = await getReferralCode(adminParticipant?.userId);
    }
  }

  res.status(200).json({
    slug,
    roomName: room?.name || "",
    roomDeleted: room?.deleted,
    participantsCount,
    referralCode,
  });
}

const getReferralCode = async (userId: string) => {
  if (!prisma) return null;

  const referralRecords = await prisma.referralCode.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  if (referralRecords[0]) {
    return referralRecords[0].referralCode;
  }

  return null;
};
