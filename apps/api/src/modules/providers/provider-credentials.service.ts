import { BadRequestException, Injectable } from "@nestjs/common";
import { Provider } from "@prisma/client";
import { type SaveProviderCredentialRequest } from "@chinta/shared";

import { PrismaService } from "../prisma/prisma.service";
import { CryptoService } from "../security/crypto.service";
import { ProvidersService } from "./providers.service";

@Injectable()
export class ProviderCredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProvidersService,
    private readonly crypto: CryptoService,
  ) {}

  async list(userId: string) {
    const credentials = await this.prisma.providerCredential.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return credentials.map((credential) => ({
      id: credential.id,
      provider: credential.provider,
      label: credential.label,
      connected: Boolean(credential.verifiedAt),
      keyFingerprint: credential.keyFingerprint,
      verifiedAt: credential.verifiedAt,
      updatedAt: credential.updatedAt,
    }));
  }

  async save(userId: string, input: SaveProviderCredentialRequest) {
    const provider = this.providers.getProvider(input.provider);
    const valid = await provider.validateCredential(input.apiKey);

    if (!valid) {
      throw new BadRequestException({
        code: "INVALID_PROVIDER_CREDENTIAL",
        message: "The provider API key could not be validated.",
      });
    }

    const credential = await this.prisma.providerCredential.upsert({
      where: {
        userId_provider: {
          userId,
          provider: Provider.openrouter,
        },
      },
      create: {
        userId,
        provider: Provider.openrouter,
        label: input.label,
        encryptedKey: this.crypto.encryptSecret(input.apiKey),
        keyFingerprint: this.crypto.fingerprint(input.apiKey),
        verifiedAt: new Date(),
      },
      update: {
        label: input.label,
        encryptedKey: this.crypto.encryptSecret(input.apiKey),
        keyFingerprint: this.crypto.fingerprint(input.apiKey),
        verifiedAt: new Date(),
      },
    });

    return {
      id: credential.id,
      provider: credential.provider,
      label: credential.label,
      keyFingerprint: credential.keyFingerprint,
      verifiedAt: credential.verifiedAt,
    };
  }

  remove(userId: string, id: string) {
    return this.prisma.providerCredential.deleteMany({
      where: { id, userId },
    });
  }
}
