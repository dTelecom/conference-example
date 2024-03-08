import { WebhookReceiver } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt_decode from "jwt-decode";
import { getNodeByAddress } from "@dtelecom/server-sdk-js/dist/contract/contract";
import prisma from "@/lib/prisma";
import type { Participant, Rewards, Room, User } from "@prisma/client";

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
          iss: jwt.iss,
        },
      });

      const now = new Date().getTime();
      if (!node || node.expiresAt.getTime() < now) {
        const nodeByAddress = await getNodeByAddress(jwt.iss);

        const expiresAt = new Date(now + 86400000);

        node = await prisma?.node.upsert({
          where: {
            iss: jwt.iss,
          },
          update: {
            key: nodeByAddress.key,
            expiresAt,
          },
          create: {
            iss: jwt.iss,
            key: nodeByAddress.key,
            expiresAt,
          },
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

    switch (event.event) {
      case "participant_joined": {
        if (event.room?.name) {
          const room = await prisma?.room.update({
            where: {
              slug: event.room.name,
            },
            data: {
              participantCount: { increment: 1 },
            },
          });

          if (
            room &&
            event.participant?.joinedAt &&
            event.participant?.identity
          ) {
            const joinedAt = new Date(event.participant?.joinedAt * 1000);
            await prisma?.participant.updateMany({
              where: {
                identity: event.participant.identity,
                roomId: room.id,
              },
              data: {
                joinedAt,
              },
            });
          }
        }

        break;
      }
      case "participant_left": {
        if (event.room?.name) {
          const room = await prisma?.room.update({
            where: {
              slug: event.room.name,
            },
            data: {
              participantCount: { decrement: 1 },
            },
          });

          if (room && event.createdAt && event.participant?.identity) {
            const leftAt = new Date(event.createdAt * 1000);

            await prisma?.participant.updateMany({
              where: {
                identity: event.participant.identity,
                roomId: room.id,
              },
              data: {
                leftAt,
              },
            });

            void addRewardPoints({
              participantIdentity: event.participant.identity,
              leftAt,
              roomId: room.id,
            });
          }
        }

        break;
      }
      case "room_finished": {
        if (event.room?.name) {
          await prisma?.room.update({
            where: {
              slug: event.room.name,
            },
            data: {
              deletedAt: new Date(),
              deleted: true,
            },
          });
        }
        break;
      }
    }
  }

  res.status(200).send("ok");
}

export const BASE_REWARDS_PER_MINUTE = 10;
export const ADMIN_POINTS_MULTIPLIER = 2;
export const REFERRAL_REWARD_PERCENTAGE = 10;

const addRewardPoints = async ({
  participantIdentity,
  leftAt,
  roomId,
}: {
  participantIdentity: Participant["identity"];
  leftAt: Date;
  roomId: Room["id"];
}) => {
  if (!prisma) {
    return;
  }

  const participant = await prisma?.participant.findFirst({
    where: {
      identity: participantIdentity,
      roomId,
    },
    select: {
      id: true,
      joinedAt: true,
      userId: true,
      room: true,
    },
  });

  if (participant && participant.joinedAt) {
    const isAdmin = participant.room.adminId === participant.id;
    const timeInRoomMin = Math.floor(
      (leftAt.getTime() - participant.joinedAt.getTime()) / 1000 / 60
    );

    if (timeInRoomMin <= 0) {
      return;
    }

    let points = timeInRoomMin * BASE_REWARDS_PER_MINUTE;
    if (isAdmin) {
      points =
        timeInRoomMin * BASE_REWARDS_PER_MINUTE * ADMIN_POINTS_MULTIPLIER;
    }

    const data = [];

    // add points to participant if authorized
    if (participant.userId) {
      data.push({
        userId: participant.userId,
        points,
        rewardType: isAdmin ? "for_room_creation" : "for_participation",
        fromParticipantId: participant.id,
      });
      void addPointsToReferral(participant.userId, points, participant.id);
    }

    // add points to admin
    if (!isAdmin && participant.room.adminId) {
      const adminParticipant = await prisma?.participant.findFirst({
        where: {
          id: participant.room.adminId,
        },
        select: {
          userId: true,
          id: true,
        },
      });

      if (adminParticipant?.userId) {
        data.push({
          userId: adminParticipant.userId,
          points,
          rewardType: "from_participant_to_admin",
          fromParticipantId: participant.id,
        });
        void addPointsToReferral(
          adminParticipant.userId,
          points,
          adminParticipant.id
        );
      }
    }

    if (data.length > 0) {
      await prisma.rewards.createMany({
        data,
      });
    }
  }
};

const addPointsToReferral = async (
  fromUserId: User["id"],
  fromPoints: Rewards["points"],
  fromParticipantId: Participant["id"]
) => {
  if (!prisma) return;
  const user = await prisma.user.findFirst({
    where: {
      id: fromUserId,
    },
  });

  if (user?.referralUserId) {
    await prisma.rewards.create({
      data: {
        userId: user?.referralUserId,
        points: Math.floor((fromPoints * REFERRAL_REWARD_PERCENTAGE) / 100),
        rewardType: "from_referral",
        fromParticipantId,
      },
    });
  }
};
