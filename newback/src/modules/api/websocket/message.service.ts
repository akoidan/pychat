import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {UserRepository} from "@/modules/rest/database/repository/user.repository";
import {PasswordService} from "@/modules/rest/password/password.service";
import type {
  ShowITypeWsInMessage,
  ShowITypeWsOutMessage,
  SyncHistoryOutMessage,
} from "@/data/types/frontend";
import {RoomRepository} from "@/modules/rest/database/repository/room.repository";
import {IpCacheService} from "@/modules/rest/ip/ip.cache.service";
import {SessionService} from "@/modules/rest/session/session.service";
import {RedisService} from "@/modules/rest/redis/redis.service";
import {PubsubService} from "@/modules/rest/pubsub/pubsub.service";
import type {WebSocketContextData} from "@/data/types/internal";
import {MessageRepository} from "@/modules/rest/database/repository/messages.repository";


@Injectable()
export class MessageService {
  public constructor(
    public readonly logger: Logger,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly ipCacheService: IpCacheService,
    private readonly redisService: RedisService,
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
    private readonly pubsubService: PubsubService,
    private readonly messageRepository: MessageRepository,
  ) {
  }

  public showIType(data: ShowITypeWsOutMessage, context: WebSocketContextData): void {
    const body: ShowITypeWsInMessage = {
      action: "showIType",
      handler: "room",
      roomId: data.roomId,
      userId: context.userId,
    };
    this.pubsubService.emit(
      "sendToClient",
      {
        body,
      },
      String(data.roomId),
    );
  }

  public async syncHistory(data: SyncHistoryOutMessage, context: WebSocketContextData) {
    const messagesIds = await this.messageRepository.getNewMessagesAfterSync(data.roomIds, data.messagesIds, data.lastSynced);
    if (data.onServerMessageIds) {
      this.messageRepository.getMessages2(data.roomIds, data.onServerMessageIds,);
    }

  /*
   *
   * If in_message[VarNames.ON_SERVER_MESSAGE_IDS]:
   * 	on_server_to_received_ids = list(Message.objects.filter(
   * 		Q(room_id__in=room_ids)
   * 		& Q(id__in=in_message[VarNames.ON_SERVER_MESSAGE_IDS])
   * 		& Q(message_status=Message.MessageStatus.received.value)
   * 	).values_list('id', flat=True))
   * else:
   * 	on_server_to_received_ids = []
   *
   * if in_message[VarNames.RECEIVED_MESSAGE_IDS] or in_message[VarNames.ON_SERVER_MESSAGE_IDS]:
   * 	ids_to_search = in_message[VarNames.RECEIVED_MESSAGE_IDS] + in_message[VarNames.ON_SERVER_MESSAGE_IDS]
   * 	read_ids = list(Message.objects.filter(
   * 		Q(room_id__in=room_ids)
   * 		& Q(id__in=ids_to_search)
   * 		& Q(message_status=Message.MessageStatus.read.value)
   * 	).values_list('id', flat=True))
   * else:
   * 	read_ids = []
   *
   * content = MessagesCreator.message_models_to_dtos(messages)
   * self.ws_write({
   * 	VarNames.CONTENT: content,
   * 	VarNames.RECEIVED_MESSAGE_IDS: on_server_to_received_ids,
   * 	VarNames.READ_MESSAGE_IDS: read_ids,
   * 	VarNames.JS_MESSAGE_ID: in_message[VarNames.JS_MESSAGE_ID],
   * 	VarNames.HANDLER_NAME: HandlerNames.NULL
   * })
   */
  }
}
