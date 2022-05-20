import {OauthSessionResponse} from "@common/model/http.base";

export type FacebookSignInResponse = OauthSessionResponse;

export interface FaceBookSignInRequest {
  token: string;
}
