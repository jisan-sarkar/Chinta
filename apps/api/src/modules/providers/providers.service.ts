import { Injectable, NotFoundException } from "@nestjs/common";
import { type Provider } from "@chinta/shared";

import { OpenRouterProvider } from "./openrouter.provider";
import { type AiProvider } from "./ai-provider";

@Injectable()
export class ProvidersService {
  constructor(private readonly openRouter: OpenRouterProvider) {}

  getProvider(provider: Provider): AiProvider {
    if (provider === "openrouter") {
      return this.openRouter;
    }

    throw new NotFoundException({
      code: "PROVIDER_NOT_FOUND",
      message: `Provider ${provider} is not supported.`,
    });
  }
}
