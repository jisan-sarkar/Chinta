import { Injectable } from "@nestjs/common";
import { Prisma, Provider } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { ProvidersService } from "../providers/providers.service";

@Injectable()
export class ModelsService {
  private readonly sparseCatalogThreshold = 25;

  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: ProvidersService,
  ) {}

  async list() {
    await this.syncOpenRouterModelsWhenSparse();

    return this.findOpenRouterModels();
  }

  private findOpenRouterModels() {
    return this.prisma.model.findMany({
      where: { provider: Provider.openrouter },
      orderBy: { name: "asc" },
    });
  }

  private async syncOpenRouterModelsWhenSparse(): Promise<void> {
    const count = await this.prisma.model.count({
      where: { provider: Provider.openrouter },
    });

    if (count >= this.sparseCatalogThreshold) {
      return;
    }

    await this.syncOpenRouterModels();
  }

  async syncOpenRouterModels(): Promise<number> {
    const provider = this.providers.getProvider("openrouter");
    const models = await provider.listModels();

    await Promise.all(
      models.map((model) => {
        const description = model.description ?? null;
        const contextWindow = model.contextWindow ?? null;
        const inputTokenPrice = model.inputTokenPrice ?? null;
        const outputTokenPrice = model.outputTokenPrice ?? null;
        const raw = model as Prisma.InputJsonValue;

        const createData: Prisma.ModelUncheckedCreateInput = {
          id: model.id,
          provider: Provider.openrouter,
          name: model.name,
          description,
          contextWindow,
          capabilities: model.capabilities,
          inputTokenPrice,
          outputTokenPrice,
          raw,
        };
        const updateData: Prisma.ModelUncheckedUpdateInput = {
          name: model.name,
          description,
          contextWindow,
          capabilities: model.capabilities,
          inputTokenPrice,
          outputTokenPrice,
          raw,
        };

        return this.prisma.model.upsert({
          where: { id: model.id },
          create: createData,
          update: updateData,
        });
      }),
    );

    return models.length;
  }
}
