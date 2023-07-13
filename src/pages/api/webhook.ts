import { WebhookReceiver } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt_decode from "jwt-decode";
import { getNodeByAddress } from "@dtelecom/server-sdk-js/dist/contract/contract";
import prisma from "@/lib/prisma";

interface JwtKey {
  iss: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST" && req.headers.authorization) {
    const jwt = jwt_decode<JwtKey>(req.headers.authorization);

    let node;
    if (prisma) {
      node = await prisma?.node.findFirst({
        where: {
          iss: jwt.iss
        }
      });

      const now = new Date().getTime();
      if (!node || node.expiresAt.getTime() < now) {
        const nodeByAddress = await getNodeByAddress(jwt.iss);

        const expiresAt = new Date(now + 86400000);

        node = await prisma?.node.upsert({
          where: {
            iss: jwt.iss
          },
          update: {
            key: nodeByAddress.key,
            expiresAt
          },
          create: {
            iss: jwt.iss,
            key: nodeByAddress.key,
            expiresAt
          }
        });
      }
    } else {
      node = await getNodeByAddress(jwt.iss);
    }

    if (!node) {
      throw new Error("node not found");
    }

    const receiver = new WebhookReceiver(jwt.iss, node.key.replace("0x", ""));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const event = receiver.receive(req.body, req.headers.authorization);

    console.log("event", event);

    switch (event.event) {
      case "participant_joined": {
        if (event.room?.name) {
          await prisma?.room.update({
            where: {
              slug: event.room.name
            },
            data: {
              participantCount: { increment: 1 }
            }
          });
        }
        break;
      }
      case "participant_left": {
        if (event.room?.name) {
          await prisma?.room.update({
            where: {
              slug: event.room.name
            },
            data: {
              participantCount: { decrement: 1 }
            }
          });
        }
        break;
      }
      case "room_finished": {
        if (event.room?.name) {
          await prisma?.room.update({
            where: {
              slug: event.room.name
            },
            data: {
              deletedAt: new Date(),
              deleted: true
            }
          });
        }
        break;
      }
    }
  }

  res.status(200).send("ok");
}
