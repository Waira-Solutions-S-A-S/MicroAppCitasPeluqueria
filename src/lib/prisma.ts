import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makePrismaClient(): PrismaClient {
  let tursoUrl = process.env.TURSO_DATABASE_URL;
  let tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    tursoUrl = tursoUrl.trim().replace(/^["']|["']$/g, "");
    if (tursoAuthToken) {
      tursoAuthToken = tursoAuthToken.trim().replace(/^["']|["']$/g, "");
    }

    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
