import type {OkResponse} from "@common/helpers";

export type ValidateEmailResponse = OkResponse;

export interface ValidateUserEmailRequest {
  email: string;
}
