import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";

export type ChintaAuth = ReturnType<typeof createBetterAuth>;

@Injectable()
export class BetterAuthService {
  readonly auth: ChintaAuth;

  constructor(
    private readonly config: ConfigService,
    prisma: PrismaService,
  ) {
    this.auth = createBetterAuth(this.config, prisma);
  }

  handler(request: Request) {
    return this.auth.handler(request);
  }

  getSession(...args: Parameters<ChintaAuth["api"]["getSession"]>) {
    return this.auth.api.getSession(...args);
  }

}

function createBetterAuth(config: ConfigService, prisma: PrismaService) {
  const googleClientId = config.get<string>("GOOGLE_CLIENT_ID");
  const googleClientSecret = config.get<string>("GOOGLE_CLIENT_SECRET");

  return betterAuth({
    appName: "Chinta",
    basePath: "/api/auth",
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    secret: config.getOrThrow<string>("BETTER_AUTH_SECRET"),
    baseURL: config.getOrThrow<string>("BETTER_AUTH_URL"),
    trustedOrigins: [config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000"],
    socialProviders:
      googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : undefined,
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 5,
        storeOTP: "hashed",
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendOtpEmail({
            email,
            otp,
            subject:
              type === "sign-in"
                ? "Your Chinta sign-in code"
                : "Your Chinta verification code",
          });
        },
      }),
    ],
  });
}

async function sendOtpEmail({
  email,
  otp,
  subject,
}: {
  email: string;
  otp: string;
  subject: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM ?? "auth@chinta.local";

  if (!resendApiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`Chinta OTP for ${email}: ${otp}`);
      return;
    }

    throw new Error("Email delivery provider is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text: `Your Chinta verification code is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your Chinta verification code is <strong>${otp}</strong>.</p><p>It expires in 5 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const providerError = await response.text().catch(() => "");
    throw new Error(
      `Failed to send OTP email: ${response.status}${
        providerError ? ` ${providerError}` : ""
      }`,
    );
  }
}
