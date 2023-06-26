import type {Gender} from "@common/model/enum/gender";
import {SessionResponse} from "@common/model/http.base";

export type SignUpResponse = SessionResponse;

export interface SignUpRequest {
  username: string;
  password: string;
  email?: string;
  sex?: Gender;
}
