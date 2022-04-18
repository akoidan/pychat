import type {
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {HttpService} from "@/modules/rest/http/http.service";
import {SessionService} from "@/modules/rest/session/session.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly sessionService: SessionService,
  ) {
  }

  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    request.userId = this.sessionService.getUserIdBySession(request.headers["session-id"]);
    return true;
  }
}
