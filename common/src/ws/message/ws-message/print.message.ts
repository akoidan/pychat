import type {
  DefaultWsInMessage,
  DefaultWsOutMessage,
} from "@common/ws/common";
import type {MessageModelDto} from "@common/model/dto/message.model.dto";
import type {GiphyDto} from "@common/model/dto/giphy.dto";

export type PrintMessageWsInMessage = DefaultWsInMessage<"printMessage", "ws-message", MessageModelDto>;

export interface PrintMessageWsOutBody {
  content: string;
  roomId: number;
  files: number[];
  id: number;
  timeDiff: number;
  parentMessage: number | null;
  tags: Record<string, number>;
  giphies: GiphyDto[];
}

export type PrintMessageWsOutMessage = DefaultWsOutMessage<"printMessage", PrintMessageWsOutBody>;
