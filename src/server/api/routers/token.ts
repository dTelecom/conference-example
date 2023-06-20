import { createTRPCRouter, publicProcedure } from "../trpc";

import { AccessToken } from "server-sdk-js";
import { env } from "@/env.mjs";
import { z } from "zod";

export const tokenRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        roomName: z
          .string()
          .regex(/^([a-z0-9]*)(-[a-z0-9]+)*$/)
          .min(3),
        identity: z.string().min(3),
      })
    )
    .query(async ({ input, ctx }) => {
      const token = new AccessToken(
        env.API_KEY,
        env.API_SECRET,
        { identity: input.identity }
      );

      token.addGrant({
        room: input.roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
      });

      const url = await token.getWsUrl(ctx.ip)

      return { token: token.toJwt(), url, identity: input.identity };
    }),
});
