import { WebhookReceiver } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt_decode from "jwt-decode";
import { getNodeByAddress } from "@dtelecom/server-sdk-js/dist/contract/contract";

const receiver = new WebhookReceiver(process.env.API_KEY!, process.env.API_SECRET!);

interface JwtKey {
  iss: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST" && req.headers.authorization) {
    const jwt = jwt_decode<JwtKey>(req.headers.authorization);
    const node = await getNodeByAddress(jwt.iss);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const event = receiver.receive(req.body, node.key, true);
    console.log("event", event);
  }
  res.status(200).send("ok");
}
