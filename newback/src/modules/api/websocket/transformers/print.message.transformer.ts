import type {ImageModel} from "@/data/model/image.model";
import type {
  CreateModel,
  PureModel,
} from "@/data/types/internal";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {PrintMessageWsInMessage} from "@/data/types/frontend";
import type {MessageModel} from "@/data/model/message.model";
import {getMessage} from "@/modules/api/websocket/transformers/message.transformer";

export function transformPrintMessage(
  message: PureModel<MessageModel>,
  mentions: CreateModel<MessageMentionModel>[],
  images: PureModel<ImageModel>[]
): PrintMessageWsInMessage {
  return {
    action: "printMessage",
    handler: "ws-message",
    message: getMessage(message, mentions, images),
  };
}
