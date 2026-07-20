import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    API_PORT: z.coerce.number().int().positive().default(4000),
    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
    BETTER_AUTH_SECRET: z.string().min(24),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:4000"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    AUTH_EMAIL_FROM: z.string().min(1).default("auth@chinta.local"),
    ENCRYPTION_KEY: z.string().min(32),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_BASE_URL: z.string().url().optional(),
    R2_ENDPOINT: z.string().url().optional(),
    SENTRY_DSN: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const hasGoogleClientId = Boolean(env.GOOGLE_CLIENT_ID);
    const hasGoogleClientSecret = Boolean(env.GOOGLE_CLIENT_SECRET);

    if (hasGoogleClientId === hasGoogleClientSecret) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      message:
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.",
      path: hasGoogleClientId ? ["GOOGLE_CLIENT_SECRET"] : ["GOOGLE_CLIENT_ID"],
    });
  });

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  return envSchema.parse(config);
}
