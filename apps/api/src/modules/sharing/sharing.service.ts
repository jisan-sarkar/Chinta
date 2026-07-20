import { Injectable, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";

import { ConversationsRepository } from "../conversations/conversations.repository";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversations: ConversationsRepository,
  ) {}

  async create(userId: string, conversationId: string) {
    const conversation = await this.conversations.findOwned(userId, conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: "CONVERSATION_NOT_FOUND",
        message: "Conversation was not found.",
      });
    }

    const messages = await this.conversations.listMessages(userId, conversationId);
    const token = nanoid(24);
    const link = await this.prisma.shareLink.create({
      data: {
        userId,
        conversationId,
        token,
        snapshot: {
          conversation,
          messages,
        },
      },
    });

    return {
      id: link.id,
      token: link.token,
      url: `/share/${link.token}`,
      createdAt: link.createdAt,
    };
  }

  async getByToken(token: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: { token, revokedAt: null },
    });

    if (!link) {
      throw new NotFoundException({
        code: "SHARE_LINK_NOT_FOUND",
        message: "Share link was not found.",
      });
    }

    return link.snapshot;
  }
}
