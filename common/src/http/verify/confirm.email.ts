import {OkResponse} from '@common/helpers';

export interface ConfirmEmailRequest {
  token: string;
}

export type ConfirmEmailResponse = OkResponse;
