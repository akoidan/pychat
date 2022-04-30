import type {FileModelDto} from "@common/model/dto/file.model.dto";
import type {MessageStatus} from "@common/model/enum/message.status";

export interface MessageModelDto {
  id: number;
  time: number;
  parentMessage: number;
  files: Record<number, FileModelDto>;
  tags: Record<number, number>;
  content: string;
  status: MessageStatus;
  symbol: string | null;
  deleted: boolean;
  threadMessagesCount: number;
  edited: number;
  roomId: number;
  userId: number;
}
