import type {ImageModel} from "@/data/model/image.model";
import type {
  CreateModel,
  PureModel,
} from "@/data/types/internal";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {MessageModel} from "@/data/model/message.model";
import {transformMessageDto} from "@/data/transformers/model/message.transformer";


export function transformPrintMessage(
  message: PureModel<MessageModel>,
  mentions: CreateModel<MessageMentionModel>[],
  images: PureModel<ImageModel>[]
): PrintMessageWsInMessage {
  return {
    action: "printMessage",
    handler: "ws-message",
    message: transformMessageDto(message, mentions, images),
  };
}
