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
import {
  ValidateEmailResponse,
  ValidateUserEmailRequest
} from '@common/http/auth/validte.email';
import {
  ValidateUserRequest,
  ValidateUserResponse
} from '@common/http/auth/validate.user';



export interface CaptchaRequest {
  captcha?: string;
}

interface TypeGeneratorForOauth1 extends SessionResponse {
  isNewAccount: true;
  username: string;
}

interface TypeGeneratorForOauth2 extends SessionResponse {
  isNewAccount: false;
}

export type OauthSessionResponse =
  TypeGeneratorForOauth1
  | TypeGeneratorForOauth2;


export interface SessionResponse {
  session: string;
}


export interface OkResponse {
  ok: true;
}
