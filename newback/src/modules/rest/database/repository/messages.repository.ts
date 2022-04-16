import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {Op} from "sequelize";
import {MessageModel} from "@/data/model/message.model";
import {MessageStatus} from "@/data/types/frontend";


@Injectable()
export class MessageRepository {
  public constructor(
    @InjectModel(MessageModel) private readonly messageModel: typeof MessageModel,
  ) {
  }

  public async getNewMessagesAfterSync(roomIds: number[], messageIds: number[], lastSynced: number): Promise<MessageModel[]> {
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
    });
  }

  public async getMessages2(roomIds: number[], onServerMessageIds: number[]): Promise<MessageModel[]> {
    return this.messageModel.findAll({
      where: {
        roomId: {
          [Op.in]: roomIds,
        },
        id: {
          [Op.in]: onServerMessageIds,
        },
        messageStatus: MessageStatus.RECEIVED,
      },
      attributes: ["id"],
    });
  }
}
