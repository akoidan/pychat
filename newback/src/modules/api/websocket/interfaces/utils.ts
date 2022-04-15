import {WebSocketContextData} from '@/data/types/internal';

export interface OnWsClose {
  closeConnection(context: WebSocketContextData);
}
