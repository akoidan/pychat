import {MessageModel} from '@/data/model/message.model';
import {MessageMentionModel} from '@/data/model/message.mention.model';
import {ImageModel} from '@/data/model/image.model';
import {SyncHistoryWsInMessage} from '@/data/types/frontend';
import {transformMessageDto} from '@/modules/api/websocket/transformers/model/message.transformer';

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
