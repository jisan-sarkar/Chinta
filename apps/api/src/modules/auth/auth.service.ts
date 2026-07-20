import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { fromNodeHeaders } from "better-auth/node";

import { BetterAuthService } from "./better-auth";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly betterAuth: BetterAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticate(headers: Record<string, string | string[] | undefined>) {
    const session = await this.betterAuth.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (session?.user) {
      await this.prisma.userSettings.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id },
        update: {},
      });

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      };
    }

    const devUserId = this.getHeader(headers, "x-user-id");
    const devEmail = this.getHeader(headers, "x-user-email") ?? "dev@chinta.local";

    if (this.config.get("NODE_ENV") !== "production" && devUserId) {
      const user = await this.prisma.user.upsert({
        where: { id: devUserId },
        create: {
          id: devUserId,
          email: devEmail,
          name: "Chinta Dev",
          emailVerified: true,
          settings: { create: {} },
        },
        update: { email: devEmail },
      });

      return { id: user.id, email: user.email, name: user.name };
    }

    throw new UnauthorizedException({
      code: "UNAUTHENTICATED",
      message: "Sign in to continue.",
    });
  }

  private getHeader(
    headers: Record<string, string | string[] | undefined>,
    name: string,
  ): string | undefined {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }
}
