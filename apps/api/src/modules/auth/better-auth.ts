import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";

import { type PrismaService } from "../prisma/prisma.service";

export function createBetterAuth(prisma: PrismaService) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.WEB_ORIGIN ?? "http://localhost:3000"],
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          if (process.env.NODE_ENV !== "production") {
            console.info(`Magic link for ${email}: ${url}`);
            return;
          }

          throw new Error("Email delivery provider is not configured.");
        },
      }),
    ],
  });
}
