const { RoomServiceClient } = require("@dtelecom/server-sdk-js");
import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import jwt_decode from "jwt-decode";
import { getWsUrl } from "@/lib/getWsUrl";
import { JwtKey } from "@/lib";

const schema = z.object({
  method: z.enum(["kick", "mute"]),
  participantIdentity: z.string(),
  room: z.string(),
  trackSid: z.string().optional()
});

interface AdminApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
  headers: {
    authorization: string;
  };
}

export default async function handler(
  req: AdminApiRequest,
  res: NextApiResponse
) {
  const jwt = jwt_decode<JwtKey>(req.headers.authorization);

  if (!jwt.video.roomAdmin) {
    res.status(403).json("Forbidden");
    return;
  }

  if (req.method === "POST") {
    const input = req.body;

    let url = await getWsUrl(req);
    url = url.replace("wss:", "https:");
    const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);

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
