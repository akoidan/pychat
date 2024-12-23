import {OkResponse} from "@common/model/http.base";

export type ValidateEmailResponse = OkResponse;

export interface ValidateUserEmailRequest {
  email: string;
}
