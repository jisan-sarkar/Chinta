import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  saveProviderCredentialRequestSchema,
  type SaveProviderCredentialRequest,
} from "@chinta/shared";

import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { type AuthenticatedUser } from "../auth/types";
import { ProviderCredentialsService } from "./provider-credentials.service";

@Controller("provider-credentials")
@UseGuards(AuthGuard)
export class ProviderCredentialsController {
  constructor(private readonly credentials: ProviderCredentialsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.credentials.list(user.id);
  }

  @Post()
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(saveProviderCredentialRequestSchema))
    body: SaveProviderCredentialRequest,
  ) {
    return this.credentials.save(user.id, body);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.credentials.remove(user.id, id);
  }
}
