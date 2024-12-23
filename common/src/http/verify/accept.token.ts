import {SessionResponse} from "@common/model/http.base";

export type AcceptTokenResponse = SessionResponse;

export interface AcceptTokenRequest {
  token: string;
  password: string;
}
