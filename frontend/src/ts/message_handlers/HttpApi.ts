import Fetch from "@/ts/classes/Fetch";
import AuthApi from "@/ts/message_handlers/http_modules/AuthApi";
import type {SessionHolder} from "@/ts/types/types";
import {XHR_API_URL} from "@/ts/utils/runtimeConsts";
import VerifyApi from "@/ts/message_handlers/http_modules/VerifyApi";
import FileApi from "@/ts/message_handlers/http_modules/FileApi";
import RestApi from "@/ts/message_handlers/http_modules/RestApi";
import JsApi from "@/ts/message_handlers/http_modules/JsApi";
import GiphyApi from "@/ts/message_handlers/http_modules/GiphyApi";
import {GIPHY_API_KEY, GIPHY_URL} from "@/ts/utils/consts";

export default class HttpApi {
  public readonly authApi: AuthApi;

  public readonly verifyApi: VerifyApi;

  public readonly fileApi: FileApi;

  public readonly restApi: RestApi;

  public readonly jsApi: JsApi;

  public readonly giphyApi: GiphyApi;

  public constructor(sessionHolder: SessionHolder) {
    const getHeaders = (): Record<string, string> => ({
      "session-id": sessionHolder.session!,
    });
    this.authApi = new AuthApi(new Fetch(`${XHR_API_URL}/auth`, getHeaders));
    this.verifyApi = new VerifyApi(new Fetch(`${XHR_API_URL}/verify`, getHeaders));
    this.fileApi = new FileApi(new Fetch(`${XHR_API_URL}/file`, getHeaders));
    this.restApi = new RestApi(new Fetch(XHR_API_URL, getHeaders));
    this.giphyApi = new GiphyApi(new Fetch(`${GIPHY_URL}/gifs`, () => ({})), GIPHY_API_KEY);
    this.jsApi = new JsApi();
  }
}
