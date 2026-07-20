import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { ModelsModule } from "../models/models.module";
import { ModelSyncProcessor } from "./model-sync.processor";

@Module({
  imports: [
    ModelsModule,
    BullModule.registerQueue({
      name: "model-sync",
    }),
  ],
  providers: [ModelSyncProcessor],
})
export class JobsModule {}
