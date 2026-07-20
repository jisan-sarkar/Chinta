import { describe, expect, it } from "vitest";

import { validateEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgresql://chinta:chinta@localhost:5432/chinta",
  BETTER_AUTH_SECRET: "development-secret-development-secret",
  ENCRYPTION_KEY: "development-encryption-key-32-bytes",
};

describe("env validation", () => {
  it("allows email-only auth when Google credentials are omitted", () => {
    expect(() => validateEnv(validEnv)).not.toThrow();
  });

  it("requires Google credentials to be configured together", () => {
    expect(() =>
      validateEnv({
        ...validEnv,
        GOOGLE_CLIENT_ID: "google-client-id",
      }),
    ).toThrow(/GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET/);
  });
});
