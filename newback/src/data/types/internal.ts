import {DefaultWsInMessage} from '@/data/types/frontend';

export interface WebSocketContextData {
  userId: number;
  id: number;
  sendToClient(data: DefaultWsInMessage<any, any>);
}
export type UserOnlineData = Record<string, string[]>

// https://stackoverflow.com/questions/48881009/convert-tinyint-field-as-boolean-in-result-using-sequelize-raw-query-node-js
export type MysqlBool = 0 | 1 | true | false  ;
