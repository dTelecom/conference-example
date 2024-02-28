import type { AuthOptions, Session } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session({ session, token }: { session: Session; token: { sub?: string } }) {
      return { ...session, address: token.sub };
    },
  },
};
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}") as
              | string
              | Partial<SiweMessage>
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result: { success: boolean } = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            // https://github.com/nextauthjs/next-auth/issues/7166#issuecomment-1508439710
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (result.success) {
            const address = siwe.address;
            if (prisma) {
              await prisma.user.upsert({
                where: {
                  wallet: address.toLowerCase(),
                },
                update: {},
                create: {
                  wallet: address.toLowerCase(),
                },
              });
            }
            return {
              id: address,
            };
          }
          return null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, { ...authOptions, providers });
}
