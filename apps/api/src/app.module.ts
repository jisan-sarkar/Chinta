import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { LoggerModule } from "nestjs-pino";
import { BullModule } from "@nestjs/bullmq";

import { validateEnv } from "./config/env";
import { AttachmentsModule } from "./modules/attachments/attachments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ChatModule } from "./modules/chat/chat.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { ModelsModule } from "./modules/models/models.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ProvidersModule } from "./modules/providers/providers.module";
import { SecurityModule } from "./modules/security/security.module";
import { SharingModule } from "./modules/sharing/sharing.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === "production"
          ? { level: "info" }
          : { level: "debug", transport: { target: "pino-pretty" } },
    }),
    BullModule.forRoot({
      connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
    }),
    PrismaModule,
    SecurityModule,
    AuthModule,
    ProvidersModule,
    ModelsModule,
    ConversationsModule,
    ChatModule,
    AttachmentsModule,
    SharingModule,
    JobsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
