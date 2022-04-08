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

  public async login(form: HTMLFormElement): Promise<SessionResponse> {
    return this.xhr.doPost<SessionResponse>({
      url: "/auth",
      isJsonDecoded: true,
      formData: new FormData(form),
    });
  }

  public async sendLogs(issue: string, browser: string, version: string): Promise<void> {
    const result: string = await this.xhr.doPost<string>({
      url: "/report_issue",
      params: {
        issue,
        browser,
        version,
      },
      checkOkString: true,
    });
  }

  public async changePassword(old_password: string, password: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/change_password",
      params: {
        old_password,
        password,
      },
      checkOkString: true,
    });
  }

  public async logout(registration_id: string | null = null): Promise<void> {
    await this.xhr.doPost({
      url: "/logout",
      params: {registration_id},
      errorDescription: "Error while logging out: ",
    });
  }

  public async sendRestorePassword(form: HTMLFormElement): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/send_restore_password",
      formData: new FormData(form),
      checkOkString: true,
    });
  }

  public async register(form: HTMLFormElement): Promise<SessionResponse> {
    return this.xhr.doPost<SessionResponse>({
      url: "/register",
      isJsonDecoded: true,
      formData: new FormData(form),
    });
  }

  public async registerDict(password: string, username: string): Promise<SessionResponse> {
    return this.xhr.doPost<SessionResponse>({
      url: "/register",
      isJsonDecoded: true,
      params: {
        username,
        password,
      },
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
      response = await this.xhr.doGet<MultiResponse>({
        isJsonDecoded: true,
        skipAuth: true,
        // https://developers.giphy.com/docs/api/endpoint#trending
        url: `/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}`,
        baseUrl: GIPHY_URL,
        process,
      });
    } else {
      response = await this.xhr.doGet<MultiResponse>({
        isJsonDecoded: true,
        skipAuth: true,
        // https://developers.giphy.com/docs/api/endpoint#search
        url: `/gifs/search?api_key=${GIPHY_API_KEY}&limit=12&q=${encodeURIComponent(text)}&offset=${offset}`,
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
    return this.xhr.doGet<OauthStatus>({
      url: "/oauth_status",
      isJsonDecoded: true,
    });
  }

  public async setGoogleOauth(token: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/set_google_oauth",
      checkOkString: true,
      params: {token},
    });
  }

  public async setFacebookOauth(token: string): Promise<void> {
    return this.xhr.doPost<void>({
      url: "/set_facebook_oauth",
      checkOkString: true,
      params: {token},
    });
  }

  public async googleAuth(token: string): Promise<OauthSessionResponse> {
    return this.xhr.doPost<OauthSessionResponse>({
      url: "/google_auth",
      isJsonDecoded: true,
      params: {
        token,
      },
    });
  }

  public async facebookAuth(token: string): Promise<OauthSessionResponse> {
    return this.xhr.doPost<OauthSessionResponse>({
      url: "/facebook_auth",
      isJsonDecoded: true,
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

  public async loadRecaptcha(): Promise<void> {
    await this.xhr.loadJs("https://www.google.com/recaptcha/api.js");
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
        isJsonEncoded: true,
        checkOkString: true,
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

  public async validateUsername(username: string, process: (r: XMLHttpRequest) => void): Promise<void> {
    return this.xhr.doPost({
      url: "/validate_user",
      params: {username},
      checkOkString: true,
      process,
    });
  }

  public async uploadProfileImage(file: Blob): Promise<void> {
    const fd = new FormData();
    fd.append("file", file);

    return this.xhr.doPost<void>({
      url: "/upload_profile_image",
      formData: fd,
      checkOkString: true,
    });
  }

  public async showProfile(id: number): Promise<ViewUserProfileDto> {
    return this.xhr.doGet<ViewUserProfileDto>({
      url: `/profile?id=${id}`,
      isJsonDecoded: true,
    });
  }

  public async changeEmail(token: string): Promise<string> {
    return this.xhr.doGet<string>({
      url: `/change_email?token=${token}`,
    });
  }

  public async changeEmailLogin(email: string, password: string): Promise<void> {
    return this.xhr.doPost({
      url: "/change_email_login",
      checkOkString: true,
      params: {
        email,
        password,
      },
    });
  }

  public async confirmEmail(token: string): Promise<string> {
    return this.xhr.doGet<string>({
      url: `/confirm_email?token=${token}`,
      checkOkString: true,
    });
  }

  public async uploadFiles(files: UploadFile[], progress: (e: ProgressEvent) => void, setXhr: (e: XMLHttpRequest) => void): Promise<SaveFileResponse> {
    const fd = new FormData();
    files.forEach((sd) => {
      fd.append(sd.key, sd.file, sd.file.name);
    });

    return this.xhr.doPost<SaveFileResponse>({
      url: "/upload_file",
      isJsonDecoded: true,
      formData: fd,
      process: (r) => {
        setXhr(r);
        r.upload.addEventListener("progress", progress);
      },
    });
  }

  public async validateEmail(email: string, process: (r: XMLHttpRequest) => void): Promise<void> {
    return this.xhr.doPost({
      url: "/validate_email",
      params: {email},
      checkOkString: true,
      process,
    });
  }

  public async verifyToken(token: string): Promise<string> {
    const value: {message: string; restoreUser: string} = await this.xhr.doPost<{message: string; restoreUser: string}>({
      url: "/verify_token",
      isJsonDecoded: true,
      params: {token},
    });
    if (value && value.message === RESPONSE_SUCCESS) {
      return value.restoreUser;
    }
    throw value.message;
  }

  public async acceptToken(token: string, password: string): Promise<void> {
    return this.xhr.doPost({
      url: "/accept_token",
      params: {
        token,
        password,
      },
      checkOkString: true,
    });
  }

  public internetAppear(m: InternetAppearMessage): void {
    if (this.retryFcb) {
      this.retryFcb();
    }
  }
}
