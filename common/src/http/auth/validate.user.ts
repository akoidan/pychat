import type {OkResponse} from "@common/helpers";

export interface ValidateUserRequest {
  username: string;
}

export type ValidateUserResponse = OkResponse;
