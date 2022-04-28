import {
  IsString,
  Length,
  Matches,
} from "class-validator";
import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {FaceBookAuthRequest} from "@common/http/auth/facebook.auth";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import {Gender} from "@common/model/enum/gender";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {
  SignInRequest,
  SignInResponse,
} from "@common/http/auth/sign.in";
import {VerificationType} from "@common/model/enum/verification.type";
import {AcceptTokenRequest} from '@common/http/verify/accept.token';


export class AcceptTokenRequestValidator implements AcceptTokenRequest {
  @IsString()
  public token: string;

  @IsString()
  @Length(3, 128, {
    message: "Passwords should contain 3-64 symbols",
  })
  @Matches(/^\S+$/, {
    message: "Password can't contain whitespaces",
  })
  public password: string;
}
