import type {MessageStatus} from "@/ts/types/model";

export interface MessageP2pDto {
  id: number;
  content: string | null;
  files: Record<string, FileP2pDto>;
  timeAgo: number;
  symbol: string | null;
  status: MessageStatus;
  parentMessage: number | null;
  deleted: boolean;
  edited: number;
  userId: number;
}

export interface FileP2pDto {
  base64: string;
  name: string;
}

export type MessagesInfo = Record<string, number | null>;
