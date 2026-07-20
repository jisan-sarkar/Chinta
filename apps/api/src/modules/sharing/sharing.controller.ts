import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";

import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { type AuthenticatedUser } from "../auth/types";
import { SharingService } from "./sharing.service";

const createShareLinkSchema = z.object({
  conversationId: z.string().uuid(),
});

type CreateShareLinkRequest = z.infer<typeof createShareLinkSchema>;

@Controller()
export class SharingController {
  constructor(private readonly sharing: SharingService) {}

  @Post("share-links")
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createShareLinkSchema))
    body: CreateShareLinkRequest,
  ) {
    return this.sharing.create(user.id, body.conversationId);
  }

  @Get("share/:token")
  get(@Param("token") token: string) {
    return this.sharing.getByToken(token);
  }
}
