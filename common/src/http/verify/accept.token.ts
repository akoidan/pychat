import {SessionResponse} from '@common/helpers';

export type AcceptTokenResponse = SessionResponse;

export interface AcceptTokenRequest {
  token: string;
  password: string;
}
