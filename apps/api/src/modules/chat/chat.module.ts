import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { ProvidersModule } from "../providers/providers.module";
import { SecurityModule } from "../security/security.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [AuthModule, ConversationsModule, ProvidersModule, SecurityModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
