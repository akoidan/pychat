import {
  Injectable,
  Logger,
} from "@nestjs/common";
import type {
  PrintMessageWsOutMessage,
  ShowITypeWsInMessage,
  ShowITypeWsOutMessage,
  SyncHistoryWsOutMessage,
} from "@/data/types/frontend";
import {MessageStatus} from "@/data/types/frontend";
import {PubsubService} from "@/modules/rest/pubsub/pubsub.service";
import type {
  CreateModel,
  WebSocketContextData,
} from "@/data/types/internal";
import {MessageRepository} from "@/modules/rest/database/repository/messages.repository";
import {Sequelize} from "sequelize-typescript";
import type {UploadedFileModel} from "@/data/model/uploaded.file.model";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {ImageModel} from "@/data/model/image.model";
import {getMaxSymbol} from "@/utils/helpers";
import {getSyncMessage} from '@/modules/api/websocket/transformers/out.message/sync.message.transformer';
import {
  getMentionsFromTags,
  getUploadedGiphies,
  groupUploadedFileToImages
} from '@/modules/api/websocket/transformers/out.message/inner.transformer';
import {transformPrintMessage} from '@/modules/api/websocket/transformers/out.message/print.message.transformer';

@Injectable()
export class MessageService {
  public constructor(
    public readonly logger: Logger,
    private readonly pubsubService: PubsubService,
    private readonly messageRepository: MessageRepository,
    private readonly sequelize: Sequelize,
  ) {
    this.messageRepository.attachHooks();
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

    const messageIdsWithSymbol: number[] = messages.filter((m) => m.symbol).map((m) => m.id);
    const images = await this.messageRepository.getImagesByMessagesId(messageIdsWithSymbol);
    const mentions = await this.messageRepository.getTagsByMessagesId(messageIdsWithSymbol);

    return getSyncMessage(readmesageIds, receivedMessageIds, messages, mentions, images);
  }

  public async printMessage(data: PrintMessageWsOutMessage, context: WebSocketContextData): Promise<void> {
    await this.sequelize.transaction(async(transaction) => {
      const files: UploadedFileModel[] = await this.messageRepository.getUploadedFiles(
        data.files,
        context.userId,
        transaction
      );
      const symbol = getMaxSymbol(files, data.tags, data.giphies);
      const time = Date.now() - data.timeDiff;
      const messageModel = await this.messageRepository.createMessage({
        roomId: data.roomId,
        time,
        messageStatus: MessageStatus.ON_SERVER,
        senderId: context.userId,
        symbol,
        parentMessageId: data.parentMessage,
        content: data.content,
        threadMessageCount: 0,
      }, transaction);

      const mentions: CreateModel<MessageMentionModel>[] = getMentionsFromTags(data, messageModel.id);
      await this.messageRepository.createMessageMentions(mentions, transaction);
      const imagesToCreate: CreateModel<ImageModel>[] = groupUploadedFileToImages(files, messageModel.id);
      const giphies: CreateModel<ImageModel>[] = getUploadedGiphies(data.giphies, messageModel.id);
      const totalMedia = [...imagesToCreate, ...giphies];
      let images: ImageModel[] = [];
      if (totalMedia.length) {
        await this.messageRepository.createImages(totalMedia, transaction);
        // We need to fetch images again, since on bulkCreate mysql doesnt return ids
        images = await this.messageRepository.getImagesByMessagesId([messageModel.id], transaction);
        await this.messageRepository.deleteUploadedFiles(files.map((f) => f.id), transaction);
      }
      const body = transformPrintMessage(messageModel, mentions, images);
      this.pubsubService.emit("sendToClient", {body}, data.roomId);
    });
  }
}
