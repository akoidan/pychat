import {
  CONNECTION_ERROR,
  GIPHY_API_KEY,
  GIPHY_URL,
  RESPONSE_SUCCESS,
} from "@/ts/utils/consts";
import type {UploadFile} from "@/ts/types/types";
import type {
  OauthSessionResponse,
  OauthStatus,
  SaveFileResponse,
  SessionResponse,
  ViewUserProfileDto,
} from "@/ts/types/dto";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Http from "@/ts/classes/Http";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {InternetAppearMessage} from "@/ts/types/messages/innerMessages";
import type {MultiResponse} from "giphy-api";
import type Subscription from "@/ts/classes/Subscription";
import {
  OkResponse,
  SendRestorePasswordRequest,
  SignInRequest
} from '@/ts/types/dto';
import {
  AcceptTokenRequest,
  AcceptTokenResponse,
  GoogleSignInResponse,
  ValidateUserResponse,
  VerifyTokenRequest,
  VerifyTokenResponse
} from '@/ts/types/backend';

export default class Api extends MessageHandler {
  protected readonly handlers: HandlerTypes<keyof Api, "*"> = {
    internetAppear: <HandlerType<"internetAppear", "*">> this.internetAppear,
  };

  protected readonly logger: Logger;

  private readonly xhr: Http;

  private retryFcb: Function | null = null;

  public constructor(xhr: Http, sub: Subscription) {
    super();
    sub.subscribe("*", this);
    this.logger = loggerFactory.getLogger("api");
    this.xhr = xhr;
  }

  public async login(body: SignInRequest): Promise<SessionResponse> {
    return this.xhr.doPost<SessionResponse>({
      url: "/auth/sign-in",
      params: {...body}
    });
  }

  public async changePassword(old_password: string, password: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/change_password",
      params: {
        old_password,
        password,
      },
    });
  }

  public async logout(registration_id: string | null = null): Promise<void> {
    await this.xhr.doPost({
      url: "/logout",
      params: {registration_id},
    });
  }

  public async sendRestorePassword(params: SendRestorePasswordRequest): Promise<OkResponse> {
    return this.xhr.doPost<OkResponse>({
      url: "/auth/send-restore-password",
      params: params as any,
    });
  }

  public async register(data: SignInRequest): Promise<SessionResponse> {
    return this.xhr.doPost<SessionResponse>({
      url: "/auth/sign-up",
      params: data as any,
    });
  }

  public async searchGiphys(
    text: string,
    offset: number,
    limit: number,
    process?: (R: XMLHttpRequest) => void,
  ): Promise<MultiResponse> {
    let response!: MultiResponse;
    if ((/^\s*$/).exec(text)) {
      // https://developers.giphy.com/docs/api/endpoint#trending
      response = await this.xhr.doGet<MultiResponse>(`/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}`, {
        baseUrl: GIPHY_URL,
        process,
      });
    } else {
      // https://developers.giphy.com/docs/api/endpoint#search
      response = await this.xhr.doGet<MultiResponse>(`/gifs/search?api_key=${GIPHY_API_KEY}&limit=12&q=${encodeURIComponent(text)}&offset=${offset}`, {
        baseUrl: GIPHY_URL,
        process,
      });
    }

    if (response?.meta?.msg === "OK") {
      return response;
    }
    throw Error(`Invalid giphy response ${response?.meta?.msg}`);
  }

  public async getOauthStatus(): Promise<OauthStatus> {
    return this.xhr.doGet<OauthStatus>( "/oauth_status");
  }

  public async setGoogleOauth(token: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/set_google_oauth",
      params: {token},
    });
  }

  public async setFacebookOauth(token: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/set_facebook_oauth",
      params: {token},
    });
  }

  public async googleAuth(token: string): Promise<GoogleSignInResponse> {
    return this.xhr.doPost<OauthSessionResponse>({
      url: "/auth/google-sign-in",
      params: {
        token,
      },
    });
  }

  public async facebookAuth(token: string): Promise<OauthSessionResponse> {
    return this.xhr.doPost<OauthSessionResponse>({
      url: "/auth/facebook-sign-in",
      params: {
        token,
      },
    });
  }

  public async loadGoogle(): Promise<void> {
    await this.xhr.loadJs("https://apis.google.com/js/platform.js");
  }

  public async loadFacebook(): Promise<void> {
    await this.xhr.loadJs("https://connect.facebook.net/en_US/sdk.js");
  }

  public async loadRecaptcha(callbackId: string): Promise<void> {
    await this.xhr.loadJs(`https://www.google.com/recaptcha/api.js?render=explicit&onload=${callbackId}`);
  }

  public async registerFCB(registration_id: string, agent: string, is_mobile: boolean): Promise<void> {
    try {
      await this.xhr.doPost({
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

  public async validateUsername(username: string, onAbortController: (controller: AbortController) => void): Promise<ValidateUserResponse> {
    return this.xhr.doPost({
      url: "/auth/validate-user",
      params: {username},
      onAbortController,
    });
  }

  public async uploadProfileImage(file: Blob): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);

    return this.xhr.doPost<void>({
      url: "/upload_profile_image",
      formData: fd,
    });
  }

  public async showProfile(id: number): Promise<ViewUserProfileDto> {
    return this.xhr.doGet<ViewUserProfileDto>(`/profile?id=${id}`);
  }

  public async changeEmail(token: string): Promise<string> {
    return this.xhr.doGet<string>(`/change_email?token=${token}`);
  }

  public async changeEmailLogin(email: string, password: string): Promise<void> {
    return this.xhr.doPost({
      url: "/change_email_login",
      params: {
        email,
        password,
      },
    });
  }

  public async confirmEmail(token: string): Promise<string> {
    return this.xhr.doGet<string>(`/confirm_email?token=${token}`);
  }

  public async uploadFiles(files: UploadFile[], progress: (e: ProgressEvent) => void, setXhr: (e: XMLHttpRequest) => void): Promise<SaveFileResponse> {
    const fd = new FormData();
    files.forEach((sd) => {
      fd.append(sd.key, sd.file, sd.file.name);
    });

    return this.xhr.doPost<SaveFileResponse>({
      url: "/upload_file",
      formData: fd,
      process: (r) => {
        setXhr(r);
        r.upload.addEventListener("progress", progress);
      },
    });
  }

  public async validateEmail(email: string, onAbortController: (controller: AbortController) => void): Promise<void> {
    return this.xhr.doPost({
      url: "/auth/validate-email",
      params: {email},
      onAbortController,
    });
  }

  public async verifyToken(params: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    return this.xhr.doPost<VerifyTokenResponse>({
      url: "/auth/verify-token",
      params: params as any,
    });
  }

  public async acceptToken(params: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.xhr.doPost({
      url: "/auth/accept-token",
      params
    });
  }

  public internetAppear(m: InternetAppearMessage): void {
    if (this.retryFcb) {
      this.retryFcb();
    }
  }
}
