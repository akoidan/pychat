import { Gender, ImageType } from '@/data/model/enums';


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


export type GoogleSignInResponse = OauthSessionResponse;
export type FacebookSignInResponse = OauthSessionResponse;

export interface SignInRequest extends CaptchaRequest {
  username?: string;
  password: string;
  email?: string;
}

export interface SendRestorePasswordRequest extends CaptchaRequest {
  username?: string;
  email?: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface AcceptTokenRequest {
  token: string;
  password: string;
}

export type AcceptTokenResponse = SessionResponse;

export interface VerifyTokenResponse extends OkResponse {
  username: string;
}

export type SendRestorePasswordResponse = OkResponse;

export interface CaptchaRequest {
  captcha?: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface FaceBookAuthRequest {
  token: string;
}

export interface ValidateUserRequest {
  username: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  email?: string;
  sex?: Gender;
}

export interface ConfirmEmailRequest {
  token: string;
}

export type ConfirmEmailResponse = OkResponse;

export interface SessionResponse {
  session: string;
}

export type SignInResponse = SessionResponse;

export type SignUpResponse = SessionResponse;

export interface OkResponse {
  ok: true;
}

export type ValidateUserResponse = OkResponse;

export type ValidateEmailResponse = OkResponse;

export interface ValidateUserEmailRequest {
  email: string;
}

export interface SaveFileResponse {
  id: number;
  previewId?: number;
  symbol: string;
}

export interface SaveFileRequest {
  file: Blob;
  name?: string;
  symbol: string;
  type: ImageType;
}
