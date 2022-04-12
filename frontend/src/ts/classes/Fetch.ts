import type {
  GetData,
  PostData,
  SessionHolder,
} from "@/ts/types/types";
import Http from "@/ts/classes/Http";
import {XHR_API_URL} from "@/ts/utils/runtimeConsts";

export default class Fetch extends Http {
  public constructor(sessionHolder: SessionHolder) {
    super(sessionHolder);
  }

  public async doGet<T>(url: string, d?: GetData): Promise<T> {
    if (d?.process) {
      debugger
      throw Error("Unable to handle process");
    }
    if (d?.baseUrl) {
      debugger
      throw Error("Unable to handle baseUrl");
    }
    const fileUrl = `${d?.baseUrl ?? XHR_API_URL}${url}`;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (!d?.baseUrl) {
      headers['session_id'] = this.sessionHolder.session!;
    }
    try {
      let response = await fetch(fileUrl, {
        method: "GET",
        mode: 'cors',
        headers
      });
      let body = await response.json();
      if (response.ok) {
        return body as T;
      }
      if (typeof body.message === 'string') {
        throw Error(body.message)
      } else if (body?.message?.length && typeof  body.message[0] === 'string') {
        throw Error(body.message[0])
      } else if (typeof body.error === 'string') {
        throw Error(body.error)
      } else {
        throw Error("Network error");
      }
    } catch (e) {
      debugger
      throw new Error(e as any);
    }
  }

  public async doPost<T>(d: PostData): Promise<T> {
    if (d?.process) {
      debugger
      throw Error("Unable to handle process");
    }
    const fileUrl = `${XHR_API_URL}${d.url}`;
    let headers: Record<string, string> = {};
    let signal = null;
    if (d.onAbortController) {
      const controller = new AbortController();
      signal = controller.signal;
      d.onAbortController(controller);
    }
    if (!d.formData) {
      headers['Content-Type'] = 'application/json';
      headers['session_id'] = this.sessionHolder.session!;
    }
    try {
      let response = await fetch(fileUrl, {
        method: "POST",
        mode: 'cors',
        signal,
        body: d.params ? JSON.stringify(d.params) : d.formData,
        headers
      });
      let body = await response.json();
      if (response.ok) {
        return body as T;
      }
      if (typeof body.message === 'string') {
        throw Error(body.message)
      } else if (body?.message?.length && typeof  body.message[0] === 'string') {
        throw Error(body.message[0])
      } else if (typeof body.error === 'string') {
        throw Error(body.error)
      } else {
        throw Error("Network error");
      }
    } catch (e) {
      throw new Error(e as any);
    }
  }
}
