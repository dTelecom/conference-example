import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { User } from "@prisma/client";
import { util } from "protobufjs";
import newError = util.newError;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" || !prisma) {
    return res.status(404);
  }

  const session = await getServerSession(req, res, authOptions);

  let user: User | null = null;
  if (session?.address) {
    user = await prisma.user.findFirst({
      where: {
        wallet: session.address,
      },
    });
  }

  if (!user) {
    throw newError("User not found");
  }

  const leaderboard = await prisma.rewards.groupBy({
    by: ["userId"],
    _sum: {
      points: true,
    },
    orderBy: {
      _sum: {
        points: "desc",
      },
    },
  });

  const result: LeaderboardRecordInternal[] = [];

  leaderboard
    .sort((a, b) => {
      if (a._sum.points === b._sum.points) {
        return a.userId < b.userId ? 1 : -1;
      }

      return b._sum.points! - a._sum.points!;
    })
    .forEach((row, index) => {
      const isCurrentUser = row.userId === user?.id;
      if (index < 10 || isCurrentUser) {
        result.push({
          points: row._sum.points || 0,
          isCurrentUser: isCurrentUser,
          position: index + 1,
          userId: row.userId,
        });
      }
    });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: result.map((row) => row.userId),
      },
    },
  });

  const clientResult: LeaderboardRecord[] = result.map((r) => ({
    ...r,
    wallet: formatWallet(users.find((u) => u.id === r.userId)?.wallet),
    userId: undefined,
  }));

  if (clientResult[10]?.isCurrentUser) {
    clientResult.splice(9, 1);
  }

  return res.status(200).json(clientResult);
}

const formatWallet = (wallet?: string) => {
  return wallet ? wallet.slice(0, 4) + "..." + wallet.slice(-4) : "";
};

interface LeaderboardRecordInternal {
  userId: string;
  position: number;
  wallet?: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardRecord {
  position: number;
  wallet?: string;
  points: number;
  isCurrentUser?: boolean;
}
