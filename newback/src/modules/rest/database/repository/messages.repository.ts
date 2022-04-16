import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {Op} from "sequelize";
import {MessageModel} from "@/data/model/message.model";
import {MessageStatus} from "@/data/types/frontend";
import {ImageModel} from "@/data/model/image.model";
import {MessageMentionModel} from "@/data/model/message.mention.model";


@Injectable()
export class MessageRepository {
  public constructor(
    @InjectModel(MessageModel) private readonly messageModel: typeof MessageModel,
    @InjectModel(ImageModel) private readonly imageModel: typeof ImageModel,
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
