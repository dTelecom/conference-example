import { AccessToken } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";

export interface IGetWsUrl {
  wsUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const clientIp = requestIp.getClientIp(req) || undefined;
  const token = new AccessToken();
  const wsUrl = await token.getWsUrl(clientIp);

  res.status(200).json({
    wsUrl,
  });
}
