import type {
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import {
  Injectable,
  mixin,
} from "@nestjs/common";
import {MessageRepository} from "@/modules/shared/database/repository/messages.repository";
import {PubsubService} from "@/modules/shared/pubsub/pubsub.service";


export const OwnRoomGuard = (selector: (dto: any) => number[]): any => {
  @Injectable()
  class OwnMessageGuardMixin implements CanActivate {
    constructor(
      private readonly messageRepository: MessageRepository,
      private readonly pubsubService: PubsubService,
    ) {
    }

    public async canActivate(
      context: ExecutionContext,
    ): Promise<boolean> {
      const ws = context.getArgByIndex(0);
      const body = context.getArgByIndex(1);
      const roomIds: number[] = selector(body).filter((m) => m);
      if (!roomIds.length) {
        return true;
      }
      const channels = this.pubsubService.getMyChannels(ws.context);
      return roomIds.every((id) => channels.includes(String(id)));
    }
  }

  return mixin(OwnMessageGuardMixin);
};

