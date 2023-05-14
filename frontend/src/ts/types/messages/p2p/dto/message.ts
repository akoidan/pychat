import {MessageStatusModel} from "@/ts/types/model";
import {FileP2pDto} from "@/ts/types/messages/p2pDto";

export interface MessageP2pDto {
  id: number;
  content: string | null;
  files: Record<string, FileP2pDto>;
  timeAgo: number;
  symbol: string | null;
  status: MessageStatusModel;
  parentMessage: number | null;
  deleted: boolean;
  edited: number;
  userId: number;
}


