import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import type {
  CreateOptions,
  Model,
  Transaction,
} from "sequelize";
import {Op} from "sequelize";
import {MessageModel} from "@/data/model/message.model";
import {ImageModel} from "@/data/model/image.model";
import {MessageMentionModel} from "@/data/model/message.mention.model";
import {UploadedFileModel} from "@/data/model/uploaded.file.model";
import type {CreateModel} from "@/data/types/internal";
import { MessageStatus } from '@/data/model/enums';


@Injectable()
export class MessageRepository {
  public constructor(
    @InjectModel(MessageModel) private readonly messageModel: typeof MessageModel,
    @InjectModel(ImageModel) private readonly imageModel: typeof ImageModel,
    @InjectModel(UploadedFileModel) private readonly uploadedFileModel: typeof UploadedFileModel,
    @InjectModel(MessageMentionModel) private readonly messageMentionModel: typeof MessageMentionModel,
  ) {
  }

  public attachHooks(): void {
    this.messageModel.afterCreate(async(message, options) => this.incrementThreadMessageCount(options, message));
    this.messageModel.afterBulkCreate(async(messages, options) => this.incrementThreadMessageCount(options, ...messages));
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

  public async getImagesByMessagesId(messageIds: number[], transaction?: Transaction): Promise<ImageModel[]> {
    return this.imageModel.findAll({
      where: {
        messageId: {
          [Op.in]: messageIds,
        },
      },
      transaction,
    });
  }

  public async getMessagesById(messageIds: number[], ...attributes: (keyof MessageModel)[]): Promise<MessageModel[]> {
    if (!messageIds.length) {
      return [];
    }
    return this.messageModel.findAll({
      where: {
        id: {
          [Op.in]: messageIds,
        },
      },
      attributes,
    });
  }

  public async saveUploadFile(data: CreateModel<UploadedFileModel>, transaction: Transaction): Promise<number> {
    const result = await this.uploadedFileModel.create(data, {transaction});
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

  public async deleteUploadedFiles(
    ids: number[],
    transaction: Transaction
  ): Promise<UploadedFileModel[]> {
    if (!ids.length) {
      return [];
    }
    await this.uploadedFileModel.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      force: true,
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

  public async createMessage(data: CreateModel<MessageModel>, transaction: Transaction): Promise<MessageModel> {
    return this.messageModel.create(data, {transaction});
  }

  public async createMessageMentions(data: CreateModel<MessageMentionModel>[], transaction: Transaction): Promise<void> {
    if (!data.length) {
      return;
    }
    await this.messageMentionModel.bulkCreate(data, {
      transaction,
    });
  }

  public async createImages(data: CreateModel<ImageModel>[], transaction: Transaction): Promise<void> {
    await this.imageModel.bulkCreate(data, {
      transaction,
    });
  }

  /** This should not be called manually, only atomatically by messsage.hook */
  private async incrementThreadMessageCount(options: CreateOptions<MessageModel>, ...messages: Model<MessageModel>[]): Promise<void> {
    // Not null
    const ids = messages.map((message) => message.getDataValue("parentMessageId")).filter((id) => id);
    if (ids.length) {
      await this.messageModel.increment("threadMessageCount", {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
        by: 1,
        transaction: options.transaction,
      });
    }
  }
}
