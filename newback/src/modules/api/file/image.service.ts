import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  ImageType,
} from "@/data/types/frontend";
import type {Metadata} from "sharp";
import * as sharp from "sharp";
import {PasswordService} from "@/modules/rest/password/password.service";
import {join} from "path";
import {writeFile} from "fs/promises";
import {FileSaveResponse} from '@/data/types/internal';

@Injectable()
export class ImageService {
  private readonly savePath: string = join(__dirname, "..", "..", "..", "..", "photos");

  public constructor(
    private readonly passwordService: PasswordService,
    private readonly logger: Logger,
  ) {

  }

  private async getName(origin: string, extension: string = "") {
    let namUrl = origin;
    if (namUrl?.endsWith(`.${extension}`)) { // exclude blah.jpeg.jpeg
      namUrl = namUrl.substring(0, namUrl.length - extension.length -1)
    }
    if (namUrl) {
      namUrl = origin.replace(/[^0-9a-zA-Z-_]+/g, "-").substring(0, 20);
    }
    let id = await this.passwordService.generateRandomString(8);
    return `${id}_${namUrl}${extension ?? `.${extension}`}`;
  }

  public async saveFile(
    userId: number,
    file: Express.Multer.File,
    symbol: string,
    type: ImageType,
    name: string
  ): Promise<FileSaveResponse> {
    let originFileName = null;
    let previewFileName = null;
    if (type === ImageType.IMAGE) {
      let saveRes = await this.saveImageFiles(file, name);
      originFileName = saveRes.originFileName;
      previewFileName = saveRes.previewFileName;
    } else {
      originFileName = await this.getName(name);
      await writeFile(`${this.savePath}${originFileName}`, file.buffer, "binary");
    }
    this.logger.log(`Saved userId ${userId} ${type} to ${originFileName} ${previewFileName}`, "file");
    return {originFileName, previewFileName};
  }

  private async saveImageFiles(
    file: Express.Multer.File,
    name: string,
  ): Promise<FileSaveResponse> {
    const origin = await sharp(file.buffer);
    const meta: Metadata = await origin.metadata();
    const proportion = Math.max(meta.width / 600, meta.height / 400); // Max 400x600
    let previewFileName = null;
    if (proportion > 1 || meta.format !== "webp") {
      previewFileName = await this.getName(name, "webp");
      await origin.
        clone().
        resize(Math.round(meta.width / proportion)).
        webp().
        toFile(`${this.savePath}${previewFileName}`);
    }
    const originFileName = await this.getName(name, meta.format);
    await origin.toFile(`${this.savePath}${originFileName}`);
    return {
      originFileName,
      previewFileName,
    };
  }
}
