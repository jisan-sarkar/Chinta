import { Controller, Get, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { ModelsService } from "./models.service";

@Controller("models")
@UseGuards(AuthGuard)
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  @Get()
  list() {
    return this.models.list();
  }
}
