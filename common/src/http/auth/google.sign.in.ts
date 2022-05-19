import type {OauthSessionResponse} from "@common/helpers";

export type GoogleSignInResponse = OauthSessionResponse;

export interface GoogleSignInRequest {
  token: string;
}
