import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {join} from "path";
import {MessageRepository} from "@/modules/shared/database/repository/messages.repository";
import type {FileSaveResponse} from "@/data/types/internal";
import {Sequelize} from "sequelize-typescript";
import {ImageService} from "@/modules/api/file/image.service";
import { ImageType } from '@/data/model/enums';
import { SaveFileResponse } from '@/data/shared/http';

@Injectable()
export class FileService {
  private readonly savePath: string = join(__dirname, "..", "..", "..", "..", "photos");

  public constructor(
    private readonly messageRepository: MessageRepository,
    private readonly logger: Logger,
    private readonly imageService: ImageService,
    private readonly sequelize: Sequelize,
  ) {

  }

  public async saveFile(
    userId: number,
    file: Express.Multer.File,
    symbol: string,
    type: ImageType,
    name?: string
  ): Promise<SaveFileResponse> {
    return this.sequelize.transaction(async(transaction) => {
      const fileSaveResponse: FileSaveResponse = await this.imageService.saveFile(userId, file, symbol, type, name);
      const id = await this.messageRepository.saveUploadFile({
        type,
        file: fileSaveResponse.originFileName,
        symbol,
        userId,
      }, transaction);
      const response: SaveFileResponse = {
        id,
        symbol,
      };
      if (fileSaveResponse.previewFileName) {
        response.previewId = await this.messageRepository.saveUploadFile({
          type: ImageType.PREVIEW,
          file: fileSaveResponse.previewFileName,
          symbol,
          userId,
        }, transaction);
      }
      return response;
    });
  }
}
