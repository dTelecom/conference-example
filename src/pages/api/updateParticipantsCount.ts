import type { NextApiRequest, NextApiResponse } from "next";
import { JwtKey, roomParticipants } from "@/pages/api/webhook";
import { TypeOf, z } from "zod";
import jwt_decode from "jwt-decode";

const schema = z.object({
    slug: z.string(),
    participantsCount: z.number().optional()
  }
);

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
  headers: {
    authorization: string;
  };
}


export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const jwt = jwt_decode<JwtKey>(req.headers.authorization);

  if (!jwt.video.roomAdmin) {
    res.status(403).json("Forbidden");
    return;
  }

  const { slug, participantsCount } = req.body;

  const maxCount = 9999;
  const count = Math.min(participantsCount || 0, maxCount);

  if (!roomParticipants[slug as string]) {
    roomParticipants[slug as string] = {
      count: 0,
      createdAt: new Date().getTime() / 1000
    };
  }

  // @ts-ignore
  roomParticipants[slug as string].count = count;

  res.status(200).send("ok");
}
