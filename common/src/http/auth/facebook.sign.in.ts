import type {OauthSessionResponse} from "@common/helpers";

export type FacebookSignInResponse = OauthSessionResponse;

export interface FaceBookSignInRequest {
  token: string;
}
