import type { NextApiRequest, NextApiResponse } from "next";
import type { Participant } from "@prisma/client";
import prisma from "@/lib/prisma";

const PARTICIPANTS_MINIMAL_COUNT = 5;
const PARTICIPATION_TIME_LIMIT_SECONDS = 600;

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

  // user participations in last 24h
  const participations = await prisma?.participant.findMany({
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
  });

  if (participations.length === 0) {
    return res.status(200).json({
      is_ok,
    });
  }

  const rooms = await prisma.room.findMany({
    where: {
      adminId: {
        in: participations.map((p) => p.id),
      },
    },
    select: {
      adminId: true,
      Participant: true,
    },
  });

  for (const room of rooms.filter(
    (r) => r.Participant.length >= PARTICIPANTS_MINIMAL_COUNT
  )) {
    let passedCount = 0;
    room.Participant.filter((p) => p.id !== room.adminId).forEach(
      (p: Participant) => {
        const joined = p.joinedAt;
        const left = p.leftAt;
        if (
          joined &&
          left &&
          left.getTime() - joined.getTime() >=
            PARTICIPATION_TIME_LIMIT_SECONDS * 1000
        ) {
          passedCount += 1;
        }
      }
    );

    if (passedCount >= PARTICIPANTS_MINIMAL_COUNT) {
      is_ok = true;
      break;
    }
  }

  return res.status(200).json({
    is_ok,
  });
}
