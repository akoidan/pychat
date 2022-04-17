import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import type {
  Transaction,
} from "sequelize";
import {
  Op,
} from "sequelize";
import {MessageModel} from "@/data/model/message.model";
import type {
  ImageType,
} from "@/data/types/frontend";
import {
  Gender,
  MessageStatus,
} from "@/data/types/frontend";
import {ImageModel} from "@/data/model/image.model";
import {MessageMentionModel} from "@/data/model/message.mention.model";
import {UploadedFileModel} from "@/data/model/uploaded.file.model";


@Injectable()
export class MessageRepository {
  public constructor(
    @InjectModel(MessageModel) private readonly messageModel: typeof MessageModel,
    @InjectModel(ImageModel) private readonly imageModel: typeof ImageModel,
    @InjectModel(UploadedFileModel) private readonly uploadedFileModel: typeof UploadedFileModel,
    @InjectModel(MessageMentionModel) private readonly messageMentionModel: typeof MessageMentionModel,
  ) {
  }

  public async getNewOnServerMessages(roomIds: number[], messageIds: number[], lastSynced: number): Promise<MessageModel[]> {
    return this.messageModel.findAll({
      where: {
        roomId: {
          [Op.in]: roomIds,
        },
        id: {
          [Op.notIn]: messageIds,
        },
        [Op.or]: {
          updatedAt: {
            [Op.gt]: Date.now() - lastSynced,
          },
          messageStatus: MessageStatus.ON_SERVER,
        },
      },
      paranoid: true,
    });
  }

  public async getMessagesByIdsAndStatus(roomIds: number[], onServerMessageIds: number[], status: MessageStatus): Promise<number[]> {
    return (await this.messageModel.findAll({
      where: {
        roomId: {
          [Op.in]: roomIds,
        },
        id: {
          [Op.in]: onServerMessageIds,
        },
        messageStatus: status,
      },
      attributes: ["id"],
      paranoid: true,
    })).map((m) => m.id);
  }

  public async getImagesByMessagesId(messageIds: number[]): Promise<ImageModel[]> {
    return this.imageModel.findAll({
      where: {
        messageId: {
          [Op.in]: messageIds,
        },
      },
    });
  }

   public async getMessagesById(messageIds: number[], ...attributes: (keyof MessageModel)[]): Promise<MessageModel[]> {
    return this.messageModel.findAll({
      where: {
        id: {
          [Op.in]: messageIds,
        },
      },
      attributes,
    });
  }

  public async saveUploadFile(data: {
    type: ImageType;
    symbol: string;
    userId: number;
    file: string;
  }, transaction: Transaction): Promise<number> {
    const result = await this.uploadedFileModel.create({
      userId: data.userId,
      symbol: data.symbol,
      type: data.type,
      file: data.file,
    }, {
      transaction,
    });
    return result.id;
  }

  public async getUploadedFiles(
    ids: number[],
    userId: number,
    transaction: Transaction
  ): Promise<UploadedFileModel[]> {
    if (!ids.length) {
      return [];
    }
    return this.uploadedFileModel.findAll({
      where: {
        userId,
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });
  }

  public async getTagsByMessagesId(messageIds: number[]): Promise<MessageMentionModel[]> {
    return this.messageMentionModel.findAll({
      where: {
        messageId: {
          [Op.in]: messageIds,
        },
      },
    });
  }
}
