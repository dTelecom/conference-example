import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
const { RoomServiceClient } = require("@dtelecom/server-sdk-js");

const schema = z.object({
    slug: z.string(),
    identity: z.string()
  }
);

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse
) {
  const input = req.body;
  const admin = await prisma?.participant.findFirst({
    where: {
      identity: input.identity
    }
  });

  if (admin?.server) {
    const url = admin.server.replace("wss:", "https:");
    const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);

    svc.authHeader({
      room: input.slug,
      roomAdmin: true
    });

    await svc.deleteRoom(input.slug).then(() => {
      console.log("room deleted");
    });
  }

  await prisma?.room.update({
    where: {
      slug: input.slug
    },
    data: {
      deletedAt: new Date(),
      deleted: true
    }
  });

  res.status(200).json("ok");
}
