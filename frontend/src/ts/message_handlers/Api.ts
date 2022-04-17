import {
  CONNECTION_ERROR,
  GIPHY_API_KEY,
  GIPHY_URL,
} from "@/ts/utils/consts";
import type {
  OauthSessionResponse,
  OauthStatus,
  OkResponse,
  SaveFileRequest,
  SaveFileResponse,
  SendRestorePasswordRequest,
  SessionResponse,
  SignInRequest,
  SignUpRequest,
  ValidateEmailResponse,
  ViewUserProfileDto,
} from "@/ts/types/dto";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type {
  AcceptTokenRequest,
  AcceptTokenResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  GoogleSignInResponse,
  HandlerType,
  HandlerTypes,
  SignUpResponse,
  ValidateUserEmailRequest,
  ValidateUserResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
} from "@/ts/types/backend";
import type {InternetAppearMessage} from "@/ts/types/messages/innerMessages";
import type {MultiResponse} from "giphy-api";
import type Subscription from "@/ts/classes/Subscription";
import type Fetch from "@/ts/classes/Fetch";

export default class Api extends MessageHandler {
  protected readonly handlers: HandlerTypes<keyof Api, "*"> = {
    internetAppear: <HandlerType<"internetAppear", "*">> this.internetAppear,
  };

  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  private retryFcb: Function | null = null;

  public constructor(fetch: Fetch, sub: Subscription) {
    super();
    sub.subscribe("*", this);
    this.logger = loggerFactory.getLogger("api");
    this.fetch = fetch;
  }

  public async signIn(body: SignInRequest): Promise<SessionResponse> {
    return this.fetch.doPost<SessionResponse>({
      url: "/auth/sign-in",
      params: {...body},
    });
  }

  public async changePassword(old_password: string, password: string): Promise<void> {
    return this.fetch.doPost<void>({
      url: "/change_password",
      params: {
        old_password,
        password,
      },
    });
  }

  public async logout(registration_id: string | null = null): Promise<void> {
    await this.fetch.doPost({
      url: "/logout",
      params: {registration_id},
    });
  }

  public async sendRestorePassword(params: SendRestorePasswordRequest): Promise<OkResponse> {
    return this.fetch.doPost<OkResponse>({
      url: "/verify/send-restore-password",
      params: params as any,
    });
  }

  public async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    return this.fetch.doPost<SessionResponse>({
      url: "/auth/sign-up",
      params: data as any,
    });
  }

  public async searchGiphys(
    text: string,
    offset: number,
    limit: number,
    onSetAbortFunction: (c: () => void) => void,
  ): Promise<MultiResponse> {
    let response!: MultiResponse;
    if ((/^\s*$/).exec(text)) {
      // https://developers.giphy.com/docs/api/endpoint#trending
      response = await this.fetch.doGet<MultiResponse>(
        `${GIPHY_URL}/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}`,
        onSetAbortFunction,
      );
    } else {
      // https://developers.giphy.com/docs/api/endpoint#search
      response = await this.fetch.doGet<MultiResponse>(
        `${GIPHY_URL}/gifs/search?api_key=${GIPHY_API_KEY}&limit=12&q=${encodeURIComponent(text)}&offset=${offset}`,
        onSetAbortFunction,
      );
    }

    if (response?.meta?.msg === "OK") {
      return response;
    }
    throw Error(`Invalid giphy response ${response?.meta?.msg}`);
  }

  public async getOauthStatus(): Promise<OauthStatus> {
    return this.fetch.doGet<OauthStatus>("/oauth_status");
  }

  public async setGoogleOauth(token: string): Promise<void> {
    return this.fetch.doPost<void>({
      url: "/set_google_oauth",
      params: {token},
    });
  }

  public async setFacebookOauth(token: string): Promise<void> {
    return this.fetch.doPost<void>({
      url: "/set_facebook_oauth",
      params: {token},
    });
  }

  public async googleAuth(token: string): Promise<GoogleSignInResponse> {
    return this.fetch.doPost<OauthSessionResponse>({
      url: "/auth/google-sign-in",
      params: {
        token,
      },
    });
  }

  public async facebookAuth(token: string): Promise<OauthSessionResponse> {
    return this.fetch.doPost<OauthSessionResponse>({
      url: "/auth/facebook-sign-in",
      params: {
        token,
      },
    });
  }

  public async loadGoogle(): Promise<void> {
    await this.fetch.loadJs("https://apis.google.com/js/platform.js");
  }

  public async loadFacebook(): Promise<void> {
    await this.fetch.loadJs("https://connect.facebook.net/en_US/sdk.js");
  }

  public async loadRecaptcha(callbackId: string): Promise<void> {
    await this.fetch.loadJs(`https://www.google.com/recaptcha/api.js?render=explicit&onload=${callbackId}`);
  }

  public async registerFCB(registration_id: string, agent: string, is_mobile: boolean): Promise<void> {
    try {
      await this.fetch.doPost({
        url: "/register_fcb",
        params: {
          registration_id,
          agent,
          is_mobile,
        },
      });
      return;
    } catch (e) {
      if (e === CONNECTION_ERROR) {
        this.retryFcb = () => {
          this.registerFCB(registration_id, agent, is_mobile);
        };
      } else {
        this.retryFcb = null;
      }
      throw e;
    }
  }

  public async validateUsername(username: string, onSetAbortFunction: (c: () => void) => void): Promise<ValidateUserResponse> {
    return this.fetch.doPost({
      url: "/auth/validate-user",
      params: {username},
      onSetAbortFunction,
    });
  }

  public async uploadProfileImage(file: Blob): Promise<void> {
    await this.fetch.upload<void>({
      url:"/upload_profile_image",
      data: {file}
    });
  }

  public async showProfile(id: number): Promise<ViewUserProfileDto> {
    return this.fetch.doGet<ViewUserProfileDto>(`/profile?id=${id}`);
  }

  public async changeEmail(token: string): Promise<string> {
    return this.fetch.doGet<string>(`/change_email?token=${token}`);
  }

  public async changeEmailLogin(email: string, password: string): Promise<void> {
    return this.fetch.doPost({
      url: "/change_email_login",
      params: {
        email,
        password,
      },
    });
  }

  public async confirmEmail(params: ConfirmEmailRequest): Promise<ConfirmEmailResponse> {
    return this.fetch.doPost({
      url: "/verify/confirm-email",
      params,
    });
  }

  public async uploadFile(data: SaveFileRequest, onProgress: (i: number) => void, onSetAbortFunction: (e: () => void) => void): Promise<SaveFileResponse> {
    return this.fetch.upload<SaveFileResponse>({
      url: "/file/upload-file",
      data,
      onSetAbortFunction,
      onProgress,
    });
  }

  public async validateEmail(params: ValidateUserEmailRequest, onSetAbortFunction: (c: () => void) => void): Promise<ValidateEmailResponse> {
    return this.fetch.doPost({
      url: "/auth/validate-email",
      params,
      onSetAbortFunction,
    });
  }

  public async verifyToken(params: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    return this.fetch.doPost<VerifyTokenResponse>({
      url: "/verify/verify-token",
      params,
    });
  }

  public async acceptToken(params: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.fetch.doPost({
      url: "/verify/accept-token",
      params,
    });
  }

  public internetAppear(m: InternetAppearMessage): void {
    if (this.retryFcb) {
      this.retryFcb();
    }
  }
}
