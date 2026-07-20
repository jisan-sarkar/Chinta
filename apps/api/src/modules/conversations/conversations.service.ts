import { Injectable, NotFoundException } from "@nestjs/common";
import {
  type CreateConversationRequest,
  type UpdateConversationRequest,
} from "@chinta/shared";

import { ConversationsRepository } from "./conversations.repository";

@Injectable()
export class ConversationsService {
  constructor(private readonly conversations: ConversationsRepository) {}

  list(userId: string, query?: string) {
    return this.conversations.list(userId, query);
  }

  create(userId: string, input: CreateConversationRequest) {
    const createInput: {
      userId: string;
      title: string;
      modelId?: string;
      temporary?: boolean;
    } = {
      userId,
      title: input.title ?? "New chat",
    };

    if (input.modelId !== undefined) {
      createInput.modelId = input.modelId;
    }

    if (input.temporary !== undefined) {
      createInput.temporary = input.temporary;
    }

    return this.conversations.create(createInput);
  }

  async update(
    userId: string,
    conversationId: string,
    input: UpdateConversationRequest,
  ) {
    await this.assertOwned(userId, conversationId);
    const updateInput: {
      title?: string;
      modelId?: string | null;
      pinned?: boolean;
      archived?: boolean;
    } = {};

    if (input.title !== undefined) {
      updateInput.title = input.title;
    }

    if (input.modelId !== undefined) {
      updateInput.modelId = input.modelId;
    }

    if (input.pinned !== undefined) {
      updateInput.pinned = input.pinned;
    }

    if (input.archived !== undefined) {
      updateInput.archived = input.archived;
    }

    return this.conversations.update(userId, conversationId, updateInput);
  }

  async delete(userId: string, conversationId: string) {
    await this.assertOwned(userId, conversationId);
    return this.conversations.softDelete(userId, conversationId);
  }

  async messages(userId: string, conversationId: string) {
    await this.assertOwned(userId, conversationId);
    return this.conversations.listMessages(userId, conversationId);
  }

  async assertOwned(userId: string, conversationId: string) {
    const conversation = await this.conversations.findOwned(userId, conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: "CONVERSATION_NOT_FOUND",
        message: "Conversation was not found.",
      });
    }

    return conversation;
  }
}
