import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import {
  createAttachmentUploadRequestSchema,
  type CreateAttachmentUploadRequest,
} from "@chinta/shared";

import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { type AuthenticatedUser } from "../auth/types";
import { AttachmentsService } from "./attachments.service";

@Controller("attachments")
@UseGuards(AuthGuard)
export class AttachmentsController {
  constructor(private readonly attachments: AttachmentsService) {}

  @Post("upload-url")
  @UsePipes(new ZodValidationPipe(createAttachmentUploadRequestSchema))
  createUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateAttachmentUploadRequest,
  ) {
    return this.attachments.createUpload(user.id, body);
  }
}
