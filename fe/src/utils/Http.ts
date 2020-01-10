import loggerFactory from "@/utils/loggerFactory";
import {PostData, SessionHolder} from "@/types/types";
import {Logger} from "lines-logger";

export default abstract class Http {
  protected httpLogger: Logger;

  protected sessionHolder: SessionHolder;

  constructor(sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLoggerColor("http", "#680061");
  }

  public abstract async doGet<T>(fileUrl: string, isJsonDecoded: boolean, checkOk?: boolean): Promise<T>;

  public abstract async doPost<T>(d: PostData<T>): Promise<T>;

  public async loadJs(fullFileUrlWithProtocol: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      this.httpLogger.log("GET out {}", fullFileUrlWithProtocol)();
      const fileRef = document.createElement("script");
      fileRef.setAttribute("type", "text/javascript");
      fileRef.setAttribute("src", fullFileUrlWithProtocol);

      document.getElementsByTagName("head")[0].appendChild(fileRef);
      fileRef.onload = resolve;
      fileRef.onerror = reject;
    });
  }
}
