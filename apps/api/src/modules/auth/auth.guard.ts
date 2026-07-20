import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { type AuthenticatedUser } from "./types";

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    request.user = await this.authService.authenticate(request.headers);
    return true;
  }
}
