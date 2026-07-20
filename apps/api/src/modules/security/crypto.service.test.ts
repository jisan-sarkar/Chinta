import { describe, expect, it } from "vitest";
import { ConfigService } from "@nestjs/config";

import { CryptoService } from "./crypto.service";

describe("CryptoService", () => {
  it("encrypts, decrypts, and fingerprints provider secrets", () => {
    const service = new CryptoService(
      new ConfigService({
        ENCRYPTION_KEY: "test-encryption-key-with-enough-entropy",
      }),
    );

    const encrypted = service.encryptSecret("sk-openrouter-secret");

    expect(encrypted).not.toContain("sk-openrouter-secret");
    expect(service.decryptSecret(encrypted)).toBe("sk-openrouter-secret");
    expect(service.fingerprint("sk-openrouter-secret")).toHaveLength(16);
  });
});
