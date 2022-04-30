import type {SessionResponse} from "@common/helpers";
import type {Gender} from "@common/model/enum/gender";

export type SignUpResponse = SessionResponse;

export interface SignUpRequest {
  username: string;
  password: string;
  email?: string;
  sex?: Gender;
}
