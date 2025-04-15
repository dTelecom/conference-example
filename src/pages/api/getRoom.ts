import type { NextApiRequest, NextApiResponse } from "next";
import { roomParticipants } from "@/lib";

export interface IGetRoomResponse {
  participantsCount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  let participantsCount = roomParticipants[slug as string]?.count || 0;

  let data: {
    slug?: string;
    participantsCount?: number;
  } = {
    slug: slug as string,
    participantsCount
  };

  res.status(200).json(data);
}
