import {
  CaptchaRequest,
  OkResponse
} from '@common/helpers';

export type SendRestorePasswordResponse = OkResponse;

export interface SendRestorePasswordRequest extends CaptchaRequest {
  username?: string;
  email?: string;
}
