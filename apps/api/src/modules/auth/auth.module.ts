import { Module } from "@nestjs/common";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { BetterAuthService } from "./better-auth";

@Module({
  providers: [AuthGuard, AuthService, BetterAuthService],
  exports: [AuthGuard, AuthService, BetterAuthService],
})
export class AuthModule {}
