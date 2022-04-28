import type {MessageModel} from "@/data/model/message.model";
import type {MessageMentionModel} from "@/data/model/message.mention.model";
import type {ImageModel} from "@/data/model/image.model";
import {transformMessageDto} from "@/data/transformers/model/message.transformer";


export function getSyncMessage(
  readMessageIds: number[],
  receivedMessageIds: number[],
  messages: MessageModel[],
  mentions: MessageMentionModel[],
  images: ImageModel[]
): SyncHistoryWsInMessage {
  return {
    readMessageIds,
    receivedMessageIds,
    content: messages.map((m) => transformMessageDto(m, mentions, images)),
  };
}
