import {
  CaptchaRequest,
  SessionResponse
} from "@common/model/http.base";

export type SignInResponse = SessionResponse;

export interface SignInRequest extends CaptchaRequest {
  username?: string;
  password: string;
  email?: string;
}
