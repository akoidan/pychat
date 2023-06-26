import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type {MultiResponse} from "giphy-api";
import type Fetch from "@/ts/classes/Fetch";

export default class GiphyApi {
  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  private readonly apiKey: string;

  public constructor(fetch: Fetch, apiKey: string) {
    this.fetch = fetch;
    this.apiKey = apiKey;
    this.logger = loggerFactory.getLogger("api");
  }

  public async searchGiphys(
    text: string,
    offset: number,
    limit: number,
    onSetAbortFunction: (c: () => void) => void,
  ): Promise<MultiResponse> {
    let response!: MultiResponse;
    if ((/^\s*$/).exec(text)) {
      // https://developers.giphy.com/docs/api/endpoint#trending
      response = await this.fetch.doGet<MultiResponse>(
        `/trending?api_key=${this.apiKey}&limit=${limit}&offset=${offset}`,
        onSetAbortFunction,
      );
    } else {
      // https://developers.giphy.com/docs/api/endpoint#search
      response = await this.fetch.doGet<MultiResponse>(
        `/search?api_key=${this.apiKey}&limit=12&q=${encodeURIComponent(text)}&offset=${offset}`,
        onSetAbortFunction,
      );
    }

    if (response?.meta?.msg === "OK") {
      return response;
    }
    throw Error(`Invalid giphy response ${response?.meta?.msg}`);
  }
}


