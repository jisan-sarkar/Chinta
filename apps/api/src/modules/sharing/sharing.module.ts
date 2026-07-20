import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { SharingController } from "./sharing.controller";
import { SharingService } from "./sharing.service";

@Module({
  imports: [AuthModule, ConversationsModule],
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
