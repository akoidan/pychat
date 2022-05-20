import {OkResponse} from "@common/model/http.base";

export interface ConfirmEmailRequest {
  token: string;
}

export type ConfirmEmailResponse = OkResponse;
