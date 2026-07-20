import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const configured = config.getOrThrow<string>("ENCRYPTION_KEY");
    this.key = createHash("sha256").update(configured).digest();
  }

  encryptSecret(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [
      "v1",
      iv.toString("base64url"),
      tag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(".");
  }

  decryptSecret(payload: string): string {
    const [version, iv, tag, ciphertext] = payload.split(".");

    if (version !== "v1" || !iv || !tag || !ciphertext) {
      throw new Error("Unsupported encrypted secret payload.");
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }

  fingerprint(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 16);
  }
}
