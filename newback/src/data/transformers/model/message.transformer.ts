import type {MessageModel} from "@/data/model/message.model";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {ImageModel} from "@/data/model/image.model";
import type {
  CreateModel,
  PureModel,
} from "@/data/types/internal";
import {transformMentionByPickingDto} from "@/data/transformers/model/mention.transformer";
import {transformImageByPickingDto} from "@/data/transformers/model/image.transformer";



export function transformMessageDto(message: PureModel<MessageModel>, mentions: CreateModel<MessageMentionModel>[], images: PureModel<ImageModel>[]): MessageModelDto {
  return {
    id: message.id,
    content: message.content,
    tags: transformMentionByPickingDto(mentions, message),
    roomId: message.roomId,
    userId: message.senderId,
    parentMessage: message.parentMessageId,
    deleted: Boolean(message.deletedAt),
    threadMessagesCount: message.threadMessageCount,
    symbol: message.symbol,
    status: message.messageStatus,
    time: message.time,
    edited: message.updatedAt.getTime(),
    files: transformImageByPickingDto(images, message),
  };
}
