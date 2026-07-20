import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { SecurityModule } from "../security/security.module";
import { OpenRouterProvider } from "./openrouter.provider";
import { ProviderCredentialsController } from "./provider-credentials.controller";
import { ProviderCredentialsService } from "./provider-credentials.service";
import { ProvidersService } from "./providers.service";

@Module({
  imports: [AuthModule, SecurityModule],
  controllers: [ProviderCredentialsController],
  providers: [OpenRouterProvider, ProvidersService, ProviderCredentialsService],
  exports: [ProvidersService, ProviderCredentialsService],
})
export class ProvidersModule {}
