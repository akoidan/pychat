import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type Fetch from "@/ts/classes/Fetch";
import type {
  SaveFileRequest,
  SaveFileResponse,
} from "@common/http/file/save.file";

export default class FileApi {
  protected readonly logger: Logger;

  private readonly fetch: Fetch;

  public constructor(fetch: Fetch) {
    this.logger = loggerFactory.getLogger("api");
    this.fetch = fetch;
  }

  public async uploadFile(data: SaveFileRequest, onProgress: (i: number) => void, onSetAbortFunction: (e: () => void) => void): Promise<SaveFileResponse> {
    return this.fetch.upload<SaveFileResponse>({
      url: "/upload-file",
      data,
      onSetAbortFunction,
      onProgress,
    });
  }
}
