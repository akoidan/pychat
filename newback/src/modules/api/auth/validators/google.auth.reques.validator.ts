import {IsString} from "class-validator";
import type {GoogleSignInRequest} from "@common/http/auth/google.sign.in";


export class GoogleAuthRequestValidator implements GoogleSignInRequest {
  @IsString()
  public token: string;
}
