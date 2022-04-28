import {
  Injectable,
  Logger,
} from "@nestjs/common";
import type {Metadata} from "sharp";
import * as sharp from "sharp";
import {PasswordService} from "@/modules/shared/password/password.service";
import {join} from "path";
import {
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import type {FileSaveResponse} from "@/data/types/internal";


@Injectable()
export class ImageService {
  private readonly savePath: string = join(__dirname, "..", "..", "..", "..", "photos");

  public constructor(
    private readonly passwordService: PasswordService,
    private readonly logger: Logger,
  ) {

  }

  public async getName(origin: string, newExtension: string) {
    let ext = "";
    let newName = origin || "";
    if (newName) {
      const res = (/\.([0-9a-z]+)$/i).exec(newName);
      if (res) {
        ext = res[1];
        newName = newName.substring(0, newName.length - res[0].length);
      }
    }
    if (newName) {
      newName = newName.replace(/[^0-9a-zA-Z-_\.]+/g, "-").substring(0, 20);
    }
    const id = await this.passwordService.generateRandomString(8);
    if (newExtension) {
      return `${id}_${newName}.${newExtension}`;
    }
    if (ext) {
      return `${id}_${newName}.${ext}`;
    }
    return `${id}_${newName}`;
  }

  public async saveFile(
    userId: number,
    file: Express.Multer.File,
    symbol: string,
    type: ImageType,
    name?: string
  ): Promise<FileSaveResponse> {
    let originFileName = null;
    let previewFileName = null;
    let ext = "";
    if (type === ImageType.IMAGE) {
      const origin = await sharp(file.buffer);
      const meta: Metadata = await origin.metadata();
      ext = meta.format;
      previewFileName = await this.savePreviewIfNeeded(meta, name, origin, file);
    }
    originFileName = await this.getName(name, ext);
    await writeFile(join(this.savePath, originFileName), file.buffer, "binary");
    this.logger.log(`Saved userId ${userId} ${type} to ${originFileName} ${previewFileName}`, "file");
    return {
      originFileName,
      previewFileName,
    };
  }


  private async savePreviewIfNeeded(meta: sharp.Metadata, name: string, origin: sharp.Sharp, file: Express.Multer.File) {
    const proportion = Math.max(meta.width / 600, meta.height / 400); // Max 400x600
    // If webp 30% bigger, dgaf
    if (proportion < 1.3 && meta.format === "webp") {
      return null;
    }
    const previewFileName = await this.getName(name, meta.format === "gif" ? "gif" : "webp");
    let cloned = origin.clone();
    if (proportion > 1) {
      cloned = cloned.resize(Math.round(meta.width / proportion));
    }
    const webpPath = join(this.savePath, previewFileName);
    if (meta.format === "gif") {
      if (proportion < 1) {
        return null;
      }
      await cloned.toFile(webpPath);
    } else {
      await cloned.webp().toFile(webpPath);
    }

    const {size} = await stat(webpPath);
    // Don't waste space, if the difference is small, revert
    if (size > file.size / 1.5) {
      await unlink(webpPath);
      return null;
    }
    return previewFileName;
  }
}
