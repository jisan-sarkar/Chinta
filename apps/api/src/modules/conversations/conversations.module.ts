import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ConversationsController } from "./conversations.controller";
import { ConversationsRepository } from "./conversations.repository";
import { ConversationsService } from "./conversations.service";

@Module({
  imports: [AuthModule],
  controllers: [ConversationsController],
  providers: [ConversationsRepository, ConversationsService],
  exports: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule {}
