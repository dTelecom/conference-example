const { RoomServiceClient } = require("@dtelecom/server-sdk-js");
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  method: z.enum(["kick", "mute"]),
  adminIdentity: z.string(),
  participantIdentity: z.string(),
  room: z.string(),
  trackSid: z.string().optional()
});

interface AdminApiRequest extends NextApiRequest {
  // use TypeOf to infer the properties from helloSchema
  body: TypeOf<typeof schema>;
}

export default async function handler(
  req: AdminApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const input = req.body;
    const admin = await prisma?.participant.findFirst({
      where: {
        identity: input.adminIdentity
      }
    });

    if (!admin || !admin.server) {
      throw new Error("Not found");
    }

    const svc = new RoomServiceClient(admin.server.replace("wss:", "https:"), process.env.API_KEY, process.env.API_SECRET);

    svc.authHeader({
      room: input.room,
      roomAdmin: true
    });

    try {
      switch (input.method) {
        case "kick":
          await svc.removeParticipant(input.room, input.participantIdentity);
          break;
        case "mute":
          if (input.trackSid) {
            await svc.mutePublishedTrack(input.room, input.participantIdentity, input.trackSid, true);
          }
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }

  res.status(200).send("ok");
}
