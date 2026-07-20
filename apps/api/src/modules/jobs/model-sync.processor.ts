import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { type Job } from "bullmq";

import { ModelsService } from "../models/models.service";

@Processor("model-sync")
export class ModelSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ModelSyncProcessor.name);

  constructor(private readonly models: ModelsService) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const count = await this.models.syncOpenRouterModels();
    this.logger.log(`Synced ${count} OpenRouter models.`);
  }
}
