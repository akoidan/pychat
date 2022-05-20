import {AcceptTokenRequest, AcceptTokenResponse} from "@common/http/verify/accept.token";
import {ConfirmEmailRequest, ConfirmEmailResponse} from "@common/http/verify/confirm.email";
import {SendRestorePasswordRequest, SendRestorePasswordResponse} from "@common/http/verify/send.restore.password";
import {VerifyTokenRequest, VerifyTokenResponse} from "@common/http/verify/verify.token";


import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Fetch from "@/ts/classes/Fetch";


export default class VerifyApi {
  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  public constructor(fetch: Fetch) {
    this.logger = loggerFactory.getLogger("api");
    this.fetch = fetch;
  }

  public async verifyToken(params: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    return this.fetch.doPost<VerifyTokenResponse>({
      url: "/verify-token",
      params,
    });
  }

  public async confirmEmail(params: ConfirmEmailRequest): Promise<ConfirmEmailResponse> {
    return this.fetch.doPost({
      url: "/confirm-email",
      params,
    });
  }


  public async acceptToken(params: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.fetch.doPost({
      url: "/accept-token",
      params,
    });
  }

  public async sendRestorePassword(params: SendRestorePasswordRequest): Promise<SendRestorePasswordResponse> {
    return this.fetch.doPost<SendRestorePasswordResponse>({
      url: "/send-restore-password",
      params: params,
    });
  }
}
