import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";

export default class JsApi {
  protected readonly logger: Logger;

  public constructor() {
    this.logger = loggerFactory.getLogger("api");
  }

  public async loadGoogle(): Promise<void> {
    await this.loadJs("https://apis.google.com/js/platform.js");
  }

  public async loadFacebook(): Promise<void> {
    await this.loadJs("https://connect.facebook.net/en_US/sdk.js");
  }

  public async loadRecaptcha(callbackId: string): Promise<void> {
    await this.loadJs(`https://www.google.com/recaptcha/api.js?render=explicit&onload=${callbackId}`);
  }

  public async loadJs(fullFileUrlWithProtocol: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      this.logger.log("GET out {}", fullFileUrlWithProtocol)();
      const fileRef = document.createElement("script");
      fileRef.setAttribute("type", "text/javascript");
      fileRef.setAttribute("src", fullFileUrlWithProtocol);

      document.getElementsByTagName("head")[0].appendChild(fileRef);
      fileRef.onload = resolve;
      fileRef.onerror = reject;
    });
  }
}


