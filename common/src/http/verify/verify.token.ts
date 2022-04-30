import type {OkResponse} from "@common/helpers";

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse extends OkResponse {
  username: string;
}
