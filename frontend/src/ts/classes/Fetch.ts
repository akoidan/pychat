import type {
  PostData,
  SessionHolder,
} from "@/ts/types/types";
import {UploadData} from "@/ts/types/types";
import {XHR_API_URL} from "@/ts/utils/runtimeConsts";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";

export default class Fetch {
  protected httpLogger: Logger;

  protected sessionHolder: SessionHolder;

  public constructor(sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLogger("http");
  }

  public async doGet<T>(url: string, onSetAbortFunction?: (c: () => void) => void): Promise<T> {
    const {signal, fetchUrl, headers} = this.prepareRequest(url, onSetAbortFunction);
    const response = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
      headers,
      signal,
    });
    return this.processResponse<T>(response);
  }

  public async doPost<T>(d: PostData): Promise<T> {
    const {headers, signal, fetchUrl} = this.prepareRequest(d.url, d.onSetAbortFunction, {
      "Content-Type": "application/json",
    });
    const response = await fetch(fetchUrl, {
      method: "POST",
      mode: "cors",
      signal,
      body: JSON.stringify(d.params),
      headers,
    });
    return this.processResponse<T>(response);
  }


  public async upload<T>({url, data, onSetAbortFunction, onProgress}: UploadData): Promise<T> {
     /*
      * https://ilikekillnerds.com/2020/09/file-upload-progress-with-the-fetch-api-is-coming/
      * https://chromestatus.com/feature/5274139738767360
      * fetch api doesnt support progress api yet
      */
    return new Promise((resolve, reject) => {
      const r = new XMLHttpRequest();
      r.addEventListener("load", () => {
        let {response} = r;
        try {
          response = JSON.parse(r.response);
          if (r.status < 200 || r.status >= 300) {
            this.processException(response);
          } else {
            resolve(response);
            return;
          }
        } catch (e) {
          reject(e);
          return;
        }
        resolve(response);
      });
      r.addEventListener("error", () => {
        reject("Network Error");
      });
      if (onSetAbortFunction) {
        onSetAbortFunction(() => {
          r.abort();
        });
      }
      if (onProgress) {
        r.upload.addEventListener("progress", (evt) => {
          if (evt.lengthComputable) {
            onProgress(evt.loaded);
          }
        });
      }
      r.open("POST", `${XHR_API_URL}${url}`);
      r.setRequestHeader("session-id", this.sessionHolder.session!);
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        form.append(key, value);
      });
      r.send(form);
    });
  }

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

  // @ts-expect-error TS2366
  private async processResponse<T>(response: Response): Promise<T> {
    const body = await response.json();
    if (response.ok) {
      return body as T;
    }
    this.processException(body);
  }

  private processException(body: any) {
    if (typeof body?.message === "string") {
      throw Error(body.message);
    } else if (body?.message?.length && typeof body.message[0] === "string") {
      throw Error(body.message[0]);
    } else if (typeof body?.error === "string") {
      throw Error(body.error);
    } else {
      throw Error("Network error");
    }
  }

  private prepareRequest(url: string, onSetAbortFunction?: (c: () => void) => void, headers: Record<string, string> = {}) {
    let signal = null;
    if (onSetAbortFunction) {
      const controller = new AbortController();
      signal = controller.signal;
      onSetAbortFunction(() => {
        controller.abort();
      });
    }
    const is3rdPartyApi = (/^https?:\/\//u).test(url);
    const fetchUrl = is3rdPartyApi ? url : `${XHR_API_URL}${url}`;
    if (!is3rdPartyApi) {
      headers["session-id"] = this.sessionHolder.session!;
    }
    return {
      signal,
      fetchUrl,
      headers,
    };
  }
}
