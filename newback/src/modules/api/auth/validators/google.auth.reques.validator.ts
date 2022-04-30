import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import {IsString} from "class-validator";


export class GoogleAuthRequestValidator implements GoogleAuthRequest {
  @IsString()
  public token: string;
}
