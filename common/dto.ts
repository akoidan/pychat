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

export interface AcceptTokenResponse extends SessionResponse {

}

export interface VerifyTokenResponse extends OkResponse {
  username: string;
}

export interface SendRestorePasswordResponse extends OkResponse {
}

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

export interface ConfirmEmailResponse extends OkResponse {
}

export interface SessionResponse {
  session: string;
}

export interface SignInResponse extends SessionResponse {

}


interface TypeGeneratorForOauth1 extends SessionResponse {
  isNewAccount: true;
  username: string;
}

interface TypeGeneratorForOauth2 extends SessionResponse {
  isNewAccount: false
}

export type OauthSessionResponse =
  TypeGeneratorForOauth1
  | TypeGeneratorForOauth2;


export type GoogleSignInResponse = OauthSessionResponse;
export type FacebookSignInResponse = OauthSessionResponse;

export interface SignUpResponse extends SessionResponse {

}

export interface OkResponse {
  ok: true;
}

export interface ValidateUserResponse extends OkResponse {

}

export interface ValidateEmailResponse extends OkResponse {

}

export interface ValidateUserEmailRequest {
  email: string;
}

// ISO/IEC 5218 1 male, 2 - female
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MessageStatus {
  ON_SERVER = 'ON_SERVER',  // uploaded to server
  READ = 'READ',
  RECEIVED = 'RECEIVED', //sent
}

export enum Theme {
  COLOR_LOR = 'COLOR_LOR',
  COLOR_REG = 'COLOR_REG',
  COLOR_WHITE = 'COLOR_WHITE'
}


export enum VerificationType {
  REGISTER = 'REGISTER', // when user sign up with email, we want to confirm that it's his/her email
  PASSWORD = 'PASSWORD', // when user request a pasword change
  EMAIL = 'EMAIL', // when user changes an email
}

export enum ImageType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  GIPHY = 'GIPHY'
}

export enum UploadedFileChoices {
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  MEDIA_RECORD = 'MEDIA_RECORD',
  AUDIO_RECORD = 'AUDIO_RECORD',
  IMAGE = 'IMAGE',
  PREVIEW = 'PREVIEW',
  ISSUE = 'ISSUE'
}
