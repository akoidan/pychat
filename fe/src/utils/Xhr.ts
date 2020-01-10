import {PostData, SessionHolder} from "@/types/types";
import {CONNECTION_ERROR, RESPONSE_SUCCESS, XHR_API_URL} from "@/utils/consts";
import Http from "@/utils/Http";

/**
 * @param params : object dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param formData : form in canse form is used
 *
 */

export default class Xhr extends Http {
  constructor(sessionHolder: SessionHolder) {
    super(sessionHolder);
  }

  public getApiUrl(url: string) {
    return `${XHR_API_URL}${url}`.replace("{}", window.location.host);
  }

  /**
   * Loads file from server on runtime
   */
  public async doGet<T>(fileUrl: string, isJsonDecoded: boolean = false, checkOk: boolean = false): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      fileUrl = this.getApiUrl(fileUrl);
      this.httpLogger.log("GET out {}", fileUrl)();
      const regexRes = (/\.(\w+)(\?.*)?$/).exec(fileUrl);
      const fileType = regexRes != undefined && regexRes.length === 3 ? regexRes[1] : null;
      const xobj = new XMLHttpRequest();
      // Special for IE
      if (xobj.overrideMimeType) {
        xobj.overrideMimeType("application/json");
      }
      xobj.open("GET", fileUrl, true); // Replace 'my_data' with the path to your file

      xobj.onreadystatechange = this.getOnreadystatechange(
        xobj,
        isJsonDecoded || false,
        checkOk,
        fileUrl,
        undefined,
        reject,
        resolve,
      );
      xobj.send(null);
    });
  }

  public async doPost<T>(d: PostData<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const r: XMLHttpRequest = new XMLHttpRequest();
      r.onreadystatechange = this.getOnreadystatechange<T>(
        r,
        d.isJsonDecoded ?? false,
        d.checkOkString ?? false,
        d.url,
        d.errorDescription,
        reject,
        resolve,
      );

      const url = this.getApiUrl(d.url);

      r.open("POST", url, true);
      let data;
      let logOut: string = "";
      if (d.isJsonEncoded) {
        data = JSON.stringify(d.params);
        r.setRequestHeader("Content-Type", "application/json");
      } else {
        /* Firefox doesn't accept null*/
        data = d.formData ? d.formData : new FormData();

        if (d.params) {
          for (const key in d.params) {
            data.append(key, <string|Blob>d.params[key]); // TODO null putting?
          }
        }
        if (data.entries) {
          const entries = data.entries();
          if (entries.next) {
            let d;
            while (d = entries.next()) {
              if (d.done) {
                break;
              }
              logOut += `${d.value[0]}= ${d.value[1]};`;
            }
          }
        }
      }
      r.setRequestHeader("session_id", this.sessionHolder.session);

      this.httpLogger.log("POST out {} ::: {} ::: {}", url, d.params, logOut)();
      if (d.process) {
        d.process(r);
      }
      r.send(data);

      return r;
    });
  }

  private getOnreadystatechange<T>(
    r: XMLHttpRequest,
    isJsonDecoded: boolean,
    checkOkString: boolean,
    url: string,
    errorDescription: string|undefined,
    reject: (error: string) => void,
    resolve: (data: T) => void,
  ): () => void {
    return () => {
      if (r.readyState === 4) {
        if (r.status === 200) {
          this.httpLogger.log("{} in {} ::: {};", "GET", url, r.response)();
        } else {
          this.httpLogger.error("{} out: {} ::: {}, status: {}", "GET", url, r.response, r.status)();
        }

        let error: string | null = null;
        let data: T|null = null;
        if (r.status === 0) {
          error = CONNECTION_ERROR;
        } else if (r.status === 200) {
          if (isJsonDecoded) {
            try {
              data = JSON.parse(r.response);
            } catch (e) {
              error = `Unable to parse response ${e}`;
            }
          } else {
            data = r.response;
          }
        } else if (r.status === 404) {
          error = "Resource not found";
        } else if (r.status === 500) {
          error = "Server error";
        } else {
          error = "Unknown server error";
        }
        if (checkOkString && !error && r.response !== RESPONSE_SUCCESS) {
          error = r.response || "Invalid response";
        }
        if (errorDescription && error) {
          error = errorDescription + error;
        }
        if (error) {
          reject(error);
        } else {
          resolve(<T>data); // If else data, could not be null there
        }
      }
    };
  }
}
