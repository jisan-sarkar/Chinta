import { Injectable } from "@nestjs/common";
import { Prisma, type MessageRole, type MessagePartType } from "@prisma/client";
import { type MessagePart } from "@chinta/shared";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConversationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, query?: string) {
    const where: Prisma.ConversationWhereInput = {
      userId,
      deletedAt: null,
      archivedAt: null,
    };

    if (query) {
      where.title = { contains: query, mode: Prisma.QueryMode.insensitive };
    }

    return this.prisma.conversation.findMany({
      where,
      orderBy: [{ pinnedAt: "desc" }, { updatedAt: "desc" }],
    });
  }

  create(input: {
    userId: string;
    title: string;
    modelId?: string;
    temporary?: boolean;
  }) {
    const data: Prisma.ConversationUncheckedCreateInput = {
      userId: input.userId,
      title: input.title,
      temporary: input.temporary ?? false,
    };

    if (input.modelId !== undefined) {
      data.modelId = input.modelId;
    }

    return this.prisma.conversation.create({
      data,
    });
  }

  update(
    userId: string,
    conversationId: string,
    data: {
      title?: string;
      modelId?: string | null;
      pinned?: boolean;
      archived?: boolean;
    },
  ) {
    const update: Prisma.ConversationUpdateInput = {};

    if (data.title !== undefined) {
      update.title = data.title;
    }

    if (data.modelId !== undefined) {
      update.modelId = data.modelId;
    }

    if (data.pinned !== undefined) {
      update.pinnedAt = data.pinned ? new Date() : null;
    }

    if (data.archived !== undefined) {
      update.archivedAt = data.archived ? new Date() : null;
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: update,
    });
  }

  softDelete(userId: string, conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date() },
    });
  }

  findOwned(userId: string, conversationId: string) {
    return this.prisma.conversation.findFirst({
      where: { id: conversationId, userId, deletedAt: null },
    });
  }

  listMessages(userId: string, conversationId: string) {
    return this.prisma.message.findMany({
      where: {
        conversation: { id: conversationId, userId, deletedAt: null },
      },
      include: { parts: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async createMessage(input: {
    conversationId: string;
    role: MessageRole;
    modelId?: string;
    parts: MessagePart[];
  }) {
    const data: Prisma.MessageUncheckedCreateInput = {
      conversationId: input.conversationId,
      role: input.role,
      parts: {
        create: input.parts.map((part, index) => {
          const item: Prisma.MessagePartUncheckedCreateWithoutMessageInput = {
            type: part.type as MessagePartType,
            content: part as Prisma.InputJsonValue,
            order: index,
          };

          if (part.type === "image" || part.type === "file") {
            item.attachmentId = part.attachmentId;
          }

          return item;
        }),
      },
    };

    if (input.modelId !== undefined) {
      data.modelId = input.modelId;
    }

    return this.prisma.message.create({
      data,
      include: { parts: { orderBy: { order: "asc" } } },
    });
  }

  touch(conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }
}
