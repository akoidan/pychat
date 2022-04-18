import type {DefaultWsInMessage, MessageStatus} from "@/data/types/frontend";

export interface WebSocketContextData {
  userId: number;
  id: string;
  sendToClient(data: DefaultWsInMessage<any, any>);
}
export type UserOnlineData = Record<string, string[]>;

// https://stackoverflow.com/questions/48881009/convert-tinyint-field-as-boolean-in-result-using-sequelize-raw-query-node-js
export type MysqlBool = 0 | 1 | false | true;

export interface FileSaveResponse {
  originFileName: string;
  previewFileName: string;
}

// https://stackoverflow.com/a/49725198/3872976
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    {
      [K in Keys]-?: Partial<Pick<T, Exclude<Keys, K>>> & Required<Pick<T, K>>
    }[Keys] & Pick<T, Exclude<keyof T, Keys>>;
