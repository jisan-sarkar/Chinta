import { Body, Controller, Post, Res, UseGuards, UsePipes } from "@nestjs/common";
import { type FastifyReply } from "fastify";
import {
  streamChatRequestSchema,
  type StreamChatRequest,
} from "@chinta/shared";

import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { type AuthenticatedUser } from "../auth/types";
import { ChatService } from "./chat.service";

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post("stream")
  @UsePipes(new ZodValidationPipe(streamChatRequestSchema))
  async stream(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: StreamChatRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    reply.raw.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    });

    try {
      for await (const chunk of this.chat.stream(user.id, body)) {
        reply.raw.write(chunk);
      }
    } finally {
      reply.raw.end();
    }
  }
}
