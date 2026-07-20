import { Injectable, NotFoundException } from "@nestjs/common";
import { MessageRole, Prisma, Provider } from "@prisma/client";
import { type MessagePart, type StreamChatRequest } from "@chinta/shared";

import { ConversationsRepository } from "../conversations/conversations.repository";
import { PrismaService } from "../prisma/prisma.service";
import { ProvidersService } from "../providers/providers.service";
import { CryptoService } from "../security/crypto.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversations: ConversationsRepository,
    private readonly providers: ProvidersService,
    private readonly crypto: CryptoService,
  ) {}

  async *stream(userId: string, input: StreamChatRequest): AsyncIterable<string> {
    const conversation =
      input.conversationId === undefined
        ? await this.conversations.create(
            this.createConversationInput(userId, input),
          )
        : await this.conversations.findOwned(userId, input.conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: "CONVERSATION_NOT_FOUND",
        message: "Conversation was not found.",
      });
    }

    const credential = await this.prisma.providerCredential.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: Provider.openrouter,
        },
      },
    });

    if (!credential) {
      throw new NotFoundException({
        code: "PROVIDER_CREDENTIAL_REQUIRED",
        message: "Add an OpenRouter API key before chatting.",
      });
    }

    await this.conversations.createMessage({
      conversationId: conversation.id,
      role: MessageRole.user,
      modelId: input.modelId,
      parts: input.parts,
    });

    const history = await this.conversations.listMessages(userId, conversation.id);
    const provider = this.providers.getProvider("openrouter");
    const apiKey = this.crypto.decryptSecret(credential.encryptedKey);
    let assistantText = "";
    let usage: Record<string, unknown> | undefined;

    yield this.event("conversation", { conversationId: conversation.id });

    for await (const chunk of provider.streamChatCompletion({
      modelId: input.modelId,
      apiKey,
      messages: history.map((message) => ({
        role: message.role.toLowerCase() as "system" | "user" | "assistant",
        parts: message.parts.map((part) => part.content as MessagePart),
      })),
    })) {
      if (chunk.type === "delta") {
        assistantText += chunk.text;
        yield this.event("delta", { text: chunk.text });
      }

      if (chunk.type === "usage") {
        usage = chunk.usage;
      }
    }

    const assistantMessage = await this.conversations.createMessage({
      conversationId: conversation.id,
      role: MessageRole.assistant,
      modelId: input.modelId,
      parts: [{ type: "text", text: assistantText }],
    });

    await this.conversations.touch(conversation.id);

    const usageEvent: Prisma.UsageEventUncheckedCreateInput = {
      userId,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      provider: Provider.openrouter,
      modelId: input.modelId,
    };

    if (usage) {
      usageEvent.raw = usage as Prisma.InputJsonValue;
    }

    await this.prisma.usageEvent.create({ data: usageEvent });

    yield this.event("done", {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
    });
  }

  private event(event: string, data: unknown): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  }

  private titleFromParts(parts: MessagePart[]): string {
    const text = parts.find((part) => part.type === "text")?.text ?? "New chat";
    return text.trim().slice(0, 80) || "New chat";
  }

  private createConversationInput(userId: string, input: StreamChatRequest) {
    const data: {
      userId: string;
      title: string;
      modelId?: string;
      temporary?: boolean;
    } = {
      userId,
      title: this.titleFromParts(input.parts),
      modelId: input.modelId,
    };

    if (input.temporary !== undefined) {
      data.temporary = input.temporary;
    }

    return data;
  }
}
