import {SessionResponse} from '@common/helpers';
import {Gender} from '@common/model/enum/gender';

export type SignUpResponse = SessionResponse;

export interface SignUpRequest {
  username: string;
  password: string;
  email?: string;
  sex?: Gender;
}
