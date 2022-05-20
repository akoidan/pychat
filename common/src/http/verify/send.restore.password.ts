import {
  CaptchaRequest,
  OkResponse
} from "@common/model/http.base";

export type SendRestorePasswordResponse = OkResponse;

export interface SendRestorePasswordRequest extends CaptchaRequest {
  username?: string;
  email?: string;
}
