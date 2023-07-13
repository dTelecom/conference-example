import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-var
  var prisma: PrismaClient | undefined;
}

const prisma = process.env.POSTGRES_URL_NON_POOLING ? global.prisma || new PrismaClient() : undefined;

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
