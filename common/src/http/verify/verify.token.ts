import {OkResponse} from "@common/model/http.base";

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse extends OkResponse {
  username: string;
}
