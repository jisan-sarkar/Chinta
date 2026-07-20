import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  createConversationRequestSchema,
  updateConversationRequestSchema,
  type CreateConversationRequest,
  type UpdateConversationRequest,
} from "@chinta/shared";

import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { type AuthenticatedUser } from "../auth/types";
import { ConversationsService } from "./conversations.service";

@Controller("conversations")
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("q") query?: string) {
    return this.conversations.list(user.id, query);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createConversationRequestSchema))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateConversationRequest,
  ) {
    return this.conversations.create(user.id, body);
  }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(updateConversationRequestSchema))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateConversationRequest,
  ) {
    return this.conversations.update(user.id, id, body);
  }

  @Delete(":id")
  delete(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.conversations.delete(user.id, id);
  }

  @Get(":id/messages")
  messages(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.conversations.messages(user.id, id);
  }
}
