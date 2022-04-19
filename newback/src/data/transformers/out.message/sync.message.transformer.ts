import {MessageModel} from '@/data/model/message.model';
import {MessageMentionModel} from '@/data/model/message.mention.model';
import {ImageModel} from '@/data/model/image.model';
import {transformMessageDto} from '@/data/transformers/model/message.transformer';
import { SyncHistoryWsInMessage } from '@/data/shared/dto';

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
