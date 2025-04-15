import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
const { RoomServiceClient } = require("@dtelecom/server-sdk-js");
import jwt_decode from "jwt-decode";
import { JwtKey, roomParticipants } from "@/lib";
import { getWsUrl } from "@/lib/getWsUrl";

const schema = z.object({
    slug: z.string()
  }
);

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
  headers: {
    authorization: string;
  };
}

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse
) {
  const jwt = jwt_decode<JwtKey>(req.headers.authorization);

  if (!jwt.video.roomAdmin) {
    res.status(403).json("Forbidden");
    return;
  }

  const { slug } = req.body;
  let url = await getWsUrl(req);
  url = url.replace("wss:", "https:");
  const svc = new RoomServiceClient(url, process.env.API_KEY, process.env.API_SECRET);

  svc.authHeader({
    room: slug,
    roomAdmin: true
  });

  await svc.deleteRoom(slug).then(() => {
    console.log("room deleted");
  });

  if (roomParticipants[slug]) {
    delete roomParticipants[slug];
  }

  res.status(200).json("ok");
}
