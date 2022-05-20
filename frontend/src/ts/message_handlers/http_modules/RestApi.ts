import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Fetch from "@/ts/classes/Fetch";
import type {
  OauthStatus,
  ViewUserProfileDto,
} from "@/ts/types/dto";

export default class RestApi {
  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  public constructor(fetch: Fetch) {
    this.logger = loggerFactory.getLogger("api");
    this.fetch = fetch;
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

  public async registerFCM(registration_id: string, agent: string, is_mobile: boolean): Promise<void> {
    await this.fetch.doPost({
      url: "/register_fcb",
      params: {
        registration_id,
        agent,
        is_mobile,
      },
    });
  }


  public async uploadProfileImage(file: Blob): Promise<void> {
    await this.fetch.upload<void>({
      url: "/upload_profile_image",
      data: {file},
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
}
