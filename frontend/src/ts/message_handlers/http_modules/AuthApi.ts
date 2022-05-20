import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import {GoogleSignInRequest} from "@common/http/auth/google.sign.in";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {SignInRequest} from "@common/http/auth/sign.in";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Fetch from "@/ts/classes/Fetch";
import type {SessionResponse} from "@common/helpers";
import type {
  FaceBookSignInRequest,
  FacebookSignInResponse,
} from "@common/http/auth/facebook.sign.in";
import type {
  ValidateEmailResponse,
  ValidateUserEmailRequest,
} from "@common/http/auth/validte.email";
import type {
  ValidateUserRequest,
  ValidateUserResponse,
} from "@common/http/auth/validate.user";

export default class AuthApi {
  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  public constructor(fetch: Fetch) {
    this.logger = loggerFactory.getLogger("api");
    this.fetch = fetch;
  }

  public async signIn(body: SignInRequest): Promise<SessionResponse> {
    return this.fetch.doPost<SessionResponse>({
      url: "/sign-in",
      params: {...body},
    });
  }

  public async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    return this.fetch.doPost<SessionResponse>({
      url: "/sign-up",
      params: data as any,
    });
  }

  public async validateUsername(params: ValidateUserRequest, onSetAbortFunction: (c: () => void) => void): Promise<ValidateUserResponse> {
    return this.fetch.doPost<ValidateUserResponse>({
      url: "/validate-user",
      params,
      onSetAbortFunction,
    });
  }

  public async googleAuth(params: GoogleSignInRequest): Promise<GoogleSignInResponse> {
    return this.fetch.doPost<GoogleSignInResponse>({
      url: "/google-sign-in",
      params,
    });
  }

  public async facebookAuth(params: FaceBookSignInRequest): Promise<FacebookSignInResponse> {
    return this.fetch.doPost<FacebookSignInResponse>({
      url: "/facebook-sign-in",
      params,
    });
  }

  public async validateEmail(params: ValidateUserEmailRequest, onSetAbortFunction: (c: () => void) => void): Promise<ValidateEmailResponse> {
    return this.fetch.doPost({
      url: "/validate-email",
      params,
      onSetAbortFunction,
    });
  }
}
