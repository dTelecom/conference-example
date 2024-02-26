import type { AuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Magic } from "@magic-sdk/admin";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export const authConfig: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "Magic Link",
      credentials: {
        didToken: { label: "DID Token", type: "text" },
      },
      async authorize(credentials) {
        magic.token.validate(credentials?.didToken || "");

        const metadata = await magic.users.getMetadataByToken(
          credentials?.didToken || ""
        );
        let id = "";
        if (prisma && metadata.issuer) {
          const user: User = await prisma.user.upsert({
            where: {
              issuer: metadata.issuer,
            },
            update: {
              email: metadata.email,
              oauthProvider: metadata.oauthProvider,
            },
            create: {
              issuer: metadata.issuer,
              email: metadata.email,
              oauthProvider: metadata.oauthProvider,
            },
          });
          id = user?.id;
        }

        return { ...metadata, id };
      },
    }),
  ],
};

export default NextAuth(authConfig);
