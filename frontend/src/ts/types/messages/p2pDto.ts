export interface MessageP2pDto {
  id: number;
  content: string|null;
  files: Record<string, FileP2pDto>;
  timeAgo: number;
  symbol: string|null;
  deleted: boolean;
  giphy: string|null;
  edited: number;
  userId: number;
}

export interface FileP2pDto {
  base64: string;
  name: string;
}

export type MessagesInfo = Record<string, number|null>;