const { WebhookReceiver } = require("@dtelecom/server-sdk-js");
import type { NextApiRequest, NextApiResponse } from "next";
import jwt_decode from "jwt-decode";
import { getNodeByAddress } from "@dtelecom/server-sdk-js/contract/contract";
import { WebhookEvent } from "@dtelecom/server-sdk-js/proto/livekit_webhook";

export interface JwtKey {
  iss: string;
  video: {
    roomAdmin: boolean;
  };
}

export let roomParticipants: Record<string, {
  count: number;
  createdAt: number;
}> = {};

const onParticipantJoinedEvent = async (event: WebhookEvent) => {
  if (
    !event.room?.name ||
    !event.participant?.joinedAt ||
    !event.participant?.identity
  ) {
    return;
  }

  const room = roomParticipants[event.room.name];
  if (room) {
    roomParticipants[event.room.name] = {
      ...room,
      count: room.count + 1,
    };
    return;
  } else {
    roomParticipants[event.room.name] = {
      count: 1,
      createdAt: event.participant.joinedAt,
    };
  }
};

const onParticipantLeftEvent = async (event: WebhookEvent) => {
  if (!event.room?.name || !event.createdAt || !event.participant?.identity)
    return;

  const room = roomParticipants[event.room.name];
  if (room) {
    roomParticipants[event.room.name] = {
      ...room,
      count: room.count > 0 ? room.count - 1 : 0,
    };
  } else {
    roomParticipants[event.room.name] = {
      count: 0,
      createdAt: event.createdAt,
    };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST" && req.headers.authorization) {
    const jwt = jwt_decode<JwtKey>(req.headers.authorization);

    const node = await getNodeByAddress(jwt.iss);

    if (!node) {
      throw new Error("node not found");
    }

    const receiver = new WebhookReceiver(jwt.iss, node.key.replace("0x", ""));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const event = receiver.receive(req.body, req.headers.authorization);

    switch (event.event) {
      case "participant_joined": {
        await onParticipantJoinedEvent(event);

        break;
      }
      case "participant_left": {
        await onParticipantLeftEvent(event);

        break;
      }
      case "room_finished": {
        if (roomParticipants[event.room.name]) {
          delete roomParticipants[event.room.name];
        }
        break;
      }
    }
  }
  res.status(200).send("ok");
}

