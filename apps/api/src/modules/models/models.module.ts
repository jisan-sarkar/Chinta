import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ProvidersModule } from "../providers/providers.module";
import { ModelsController } from "./models.controller";
import { ModelsService } from "./models.service";

@Module({
  imports: [AuthModule, ProvidersModule],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
