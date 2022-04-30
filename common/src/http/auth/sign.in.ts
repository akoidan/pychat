import type {
  CaptchaRequest,
  SessionResponse,
} from "@common/helpers";

export type SignInResponse = SessionResponse;

export interface SignInRequest extends CaptchaRequest {
  username?: string;
  password: string;
  email?: string;
}
