
import {GoogleSignInRequest} from "@common/http/auth/google.sign.in";


import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Fetch from "@/ts/classes/Fetch";





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
