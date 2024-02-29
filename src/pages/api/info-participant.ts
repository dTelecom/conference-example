import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const PARTICIPATION_TIME_LIMIT_SECONDS = 300;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" || !prisma) {
    return res.status(404);
  }

  let is_ok = false;

  const address = req.query.address as string;
  const user = await prisma.user.findFirst({
    where: {
      wallet: address.toLowerCase(),
    },
  });

  if (!user) {
    return res.status(200).json({
      is_ok,
    });
  }

  const lastDay = Date.now() - 24 * 60 * 60 * 1000;

  const participants = await prisma?.participant.findMany({
    where: {
      AND: [
        {
          userId: user.id,
        },
        {
          joinedAt: {
            gte: new Date(lastDay),
          },
        },
      ],
    },
    select: {
      room: true,
      joinedAt: true,
      leftAt: true,
      id: true,
    },
  });

  for (const participant of participants) {
    const joined = participant.joinedAt;
    const left = participant.leftAt;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const roomAdminId = participant.room.adminId;
    if (
      participant.id !== roomAdminId &&
      joined &&
      left &&
      left.getTime() - joined.getTime() >=
        PARTICIPATION_TIME_LIMIT_SECONDS * 1000
    ) {
      is_ok = true;
      break;
    }
  }

  return res.status(200).json({
    is_ok,
  });
}
