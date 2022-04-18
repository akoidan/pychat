import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {UserRepository} from "@/modules/rest/database/repository/user.repository";
import {PasswordService} from "@/modules/rest/password/password.service";
import type {
  GiphyDto,
  PrintMessageWsInMessage,
  PrintMessageWsOutMessage,
  ShowITypeWsInMessage,
  ShowITypeWsOutMessage,
  SyncHistoryWsOutMessage,
} from "@/data/types/frontend";
import {MessageStatus} from "@/data/types/frontend";
import {RoomRepository} from "@/modules/rest/database/repository/room.repository";
import {IpCacheService} from "@/modules/rest/ip/ip.cache.service";
import {SessionService} from "@/modules/rest/session/session.service";
import {RedisService} from "@/modules/rest/redis/redis.service";
import {PubsubService} from "@/modules/rest/pubsub/pubsub.service";
import type {WebSocketContextData} from "@/data/types/internal";
import {MessageRepository} from "@/modules/rest/database/repository/messages.repository";
import {
  getSyncMessage,
  transformPrintMessage
} from "@/modules/api/websocket/transformers/ws.transformer";
import {Sequelize} from "sequelize-typescript";
import type {UploadedFileModel} from "@/data/model/uploaded.file.model";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {ImageModel} from "@/data/model/image.model";
import {groupUploadedFileToImages} from "@/modules/api/websocket/transformers/inner.transformer";
import {getMaxSymbol} from '@/utils/helpers';




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
    private readonly sequelize: Sequelize,
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

  public async syncHistory(data: SyncHistoryWsOutMessage, context: WebSocketContextData) {
    // MessageStatus.ON_SERVER
    const messages = await this.messageRepository.getNewOnServerMessages(
      data.roomIds,
      data.messagesIds,
      data.lastSynced
    );

    let receivedMessageIds = [];
    if (data.onServerMessageIds) {
      receivedMessageIds = await this.messageRepository.getMessagesByIdsAndStatus(
        data.roomIds,
        data.onServerMessageIds,
        MessageStatus.RECEIVED
      );
    }

    let readmesageIds = [];
    if (data.receivedMessageIds) {
      const ids = [...data.receivedMessageIds, ...data.onServerMessageIds];
      readmesageIds = await this.messageRepository.getMessagesByIdsAndStatus(
        data.roomIds,
        ids,
        MessageStatus.READ
      );
    }

    const messageIdsWithSymbol: number[] = messages.filter((m) => m.symbol).
      map((m) => m.id);
    const images = await this.messageRepository.getImagesByMessagesId(messageIdsWithSymbol);
    const mentions = await this.messageRepository.getTagsByMessagesId(messageIdsWithSymbol);

    return getSyncMessage(readmesageIds, receivedMessageIds, messages, mentions, images);
  }

  public async printMessage(data: PrintMessageWsOutMessage, context: WebSocketContextData) {
    return this.sequelize.transaction(async(transaction) => {
      const files: UploadedFileModel[] = await this.messageRepository.getUploadedFiles(
        data.files,
        context.userId,
        transaction
      );
      const symbol = getMaxSymbol(files, data.tags, data.giphies);
      const time = Date.now() - data.timeDiff;
      const messageId = await this.messageRepository.createMessage({
        roomId: data.roomId,
        time,
        messageStatus: MessageStatus.ON_SERVER,
        senderId: context.userId,
        symbol,
        parentMessageId: data.parentMessage,
        content: data.content,
      }, transaction);
      let tagsData: Partial<MessageMentionModel>[] = [];
      if (data.tags && Object.keys(data.tags).length) {
        tagsData = Object.entries(data.tags).map(([symbol, userId]) => ({
          messageId,
          userId,
          symbol,
        }));
        await this.messageRepository.createMessageMentions(tagsData, transaction);
      }
      let resImages: Record<string, Partial<ImageModel>> = {};
      if (files.length) {
        const images: Partial<ImageModel>[] = groupUploadedFileToImages(files, messageId);
        await this.messageRepository.createImages(images, transaction);
        resImages = Object.fromEntries(images.map((i) => [i.symbol, i]));
      }
      const response = transformPrintMessage(resImages, data, symbol, context.userId, time, messageId, tagsData);
      this.pubsubService.emit("printPubSubMessage", {
        body: response,
      }, data.roomId);
    });
  }
}
