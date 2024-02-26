import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateUUID } from "@/lib/client-utils";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/pages/api/auth/[...nextauth]";
import type { User } from "@prisma/client";

const schema = z.object({
  roomName: z.string().min(3),
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const input = req.body;
  const identity = generateUUID();
  const session = await getServerSession(req, res, authConfig);
  const slug = generateUUID();

  if (prisma) {
    const room = await prisma?.room.create({
      data: {
        name: input.roomName,
        slug,
      },
    });

    let user: User | null = null;
    if (session?.user?.email) {
      user = await prisma?.user.findFirst({
        where: {
          email: session.user.email,
        },
      });
    }

    const admin = await prisma?.participant.create({
      data: {
        identity,
        roomId: room?.id,
        userId: user?.id,
      },
    });

    await prisma?.room.update({
      where: {
        id: room?.id,
      },
      data: {
        adminId: admin.id,
      },
    });
  }

  res.status(200).json({ identity, slug });
}
