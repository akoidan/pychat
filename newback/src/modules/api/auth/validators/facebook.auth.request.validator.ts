import {IsString} from "class-validator";
import type {FaceBookSignInRequest} from "@common/http/auth/facebook.sign.in";

export class FacebookAuthRequestValidator implements FaceBookSignInRequest {
  @IsString()
  public token: string;
}
