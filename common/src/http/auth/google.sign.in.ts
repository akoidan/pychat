import {OauthSessionResponse} from "@common/model/http.base";

export type GoogleSignInResponse = OauthSessionResponse;

export interface GoogleSignInRequest {
  token: string;
}
