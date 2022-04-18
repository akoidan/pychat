import type {MessageModel} from "@/data/model/message.model";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {ImageModel} from "@/data/model/image.model";
import type {MessageModelDto} from "@/data/types/frontend";
import {getTags} from "@/modules/api/websocket/transformers/mention.transformer";
import {getFiles} from "@/modules/api/websocket/transformers/image.transformer";
import type {
  CreateModel,
  PureModel,
} from "@/data/types/internal";

export function getMessage(message: PureModel<MessageModel>, mentions: CreateModel<MessageMentionModel>[], images: PureModel<ImageModel>[]): MessageModelDto {
  return {
    id: message.id,
    content: message.content,
    tags: getTags(mentions, message),
    roomId: message.roomId,
    userId: message.senderId,
    parentMessage: message.parentMessageId,
    deleted: Boolean(message.deletedAt),
    threadMessagesCount: message.threadMessageCount,
    symbol: message.symbol,
    status: message.messageStatus,
    time: message.time,
    edited: message.updatedAt.getTime(),
    files: getFiles(images, message),
  };
}
