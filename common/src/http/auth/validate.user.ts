import {OkResponse} from "@common/model/http.base";

export interface ValidateUserRequest {
  username: string;
}

export type ValidateUserResponse = OkResponse;
