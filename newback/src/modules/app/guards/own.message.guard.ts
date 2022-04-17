import type {
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import {
  Injectable,
  mixin,
} from "@nestjs/common";
import {MessageRepository} from "@/modules/rest/database/repository/messages.repository";


export const MessagesFromMyRoomGuard = (selector: (dto: any) => number[]) => {
  @Injectable()
  class OwnMessageGuardMixin implements CanActivate {
    constructor(
      private readonly messageRepository: MessageRepository,
    ) {
    }

    public async canActivate(
      context: ExecutionContext,
    ): Promise<boolean> {
      const ws = context.switchToWs();
      await this.messageRepository.getMessagesById(selector(ws));
      const request = context.switchToHttp().getRequest();
      // Request.userId = this.sessionService.getUserIdBySession(request.headers["session-id"]);
      return true;
    }
  }
  return mixin(OwnMessageGuardMixin);
};


@Injectable()
export class OwnMessageGuardMixin implements CanActivate {
  constructor(
    private readonly messageRepository: MessageRepository,
  ) {
  }

  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const ws = context.switchToWs();
    await this.messageRepository.getMessagesById([3]);
    const request = context.switchToHttp().getRequest();
    // Request.userId = this.sessionService.getUserIdBySession(request.headers["session-id"]);
    return true;
  }
}
