import type {PostData, UploadData} from "@/ts/types/types";
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import {CONNECTION_ERROR} from "@/ts/utils/consts";

export default class Fetch {
  protected httpLogger: Logger;

  protected getHeaders: () => Record<string, string>;

  private readonly url: string;

  public constructor(url: string, getHeaders: () => Record<string, string>) {
    this.httpLogger = loggerFactory.getLogger("http");
    this.url = url;
    this.getHeaders = getHeaders;
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
        try {
          let response = JSON.parse(r.response);
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
      });
      r.addEventListener("error", () => {
        reject(CONNECTION_ERROR);
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
      r.open("POST", `${this.url}${url}`);
      Object.entries(this.getHeaders()).forEach(([k, v]) => {
        r.setRequestHeader(k, v);
      });
      const form = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        form.append(key, value);
      });
      r.send(form);
    });
  }

  private async processResponse<T>(response: Response): Promise<T> {
    const body = await response.json();
    if (response.ok) {
      return body as T;
    }
    this.processException(body);
  }

  private processException(body: any): never {
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
    Object.entries(this.getHeaders()).forEach(([k, v]) => {
      headers[k] = v;
    });
    return {
      signal,
      fetchUrl: `${this.url}${url}`,
      headers,
    };
  }
}
