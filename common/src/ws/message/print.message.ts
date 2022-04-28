import {
  DefaultWsInMessage,
  DefaultWsOutMessage
} from '@common/ws/common';
import {MessageModelDto} from '@common/model/dto/message.model.dto';
import {GiphyDto} from '@common/model/dto/giphy.dto';

export type PrintMessageWsInMessage = DefaultWsInMessage<"printMessage", "ws-message", MessageModelDto>;

export type PrintMessageWsOutMessage = DefaultWsOutMessage<"printMessage", {
  content: string;
  roomId: number;
  files: number[];
  id: number;
  timeDiff: number;
  parentMessage: number | null;
  tags: Record<string, number>;
  giphies: GiphyDto[];
}>;
