import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {RoomModel} from "@/data/model/room.model";
import {RoomUsersModel} from "@/data/model/room.users.model";
import type {
  Transaction,
} from "sequelize";
import {
  Op,
} from "sequelize";
import {ChannelModel} from "@/data/model/channel.model";
import {GetRoomsForUser} from '@/data/types/internal';

@Injectable()
export class RoomRepository {
  public constructor(
    @InjectModel(RoomModel) private readonly roomModel: typeof RoomModel,
    @InjectModel(RoomUsersModel) private readonly roomUsersModel: typeof RoomUsersModel,
    @InjectModel(ChannelModel) private readonly channelsModel: typeof ChannelModel,
  ) {
  }

  public async createRoomUser(roomId: number, userId: number, transaction: Transaction): Promise<void> {
    await this.roomUsersModel.create({
      roomId,
      userId,
      notifications: false,
    }, {
      transaction,
      raw: true,
    });
  }

  public async getAllChannels(ids: number[]): Promise<ChannelModel[]> {
    return this.channelsModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }

  public async usersForUser(userId: number): Promise<number[]> {
    const myRoomIds = await this.roomUsersModel.findAll({
      where: {
        userId,
      },
      attributes: ["roomId"],
    });
    const ru = await this.roomUsersModel.findAll({
      where: {
        roomId: {
          [Op.in]: myRoomIds.map((r) => r.roomId),
        },
      },
      attributes: ["userId"],
    });
    return ru.map((ru) => ru.userId);
  }

  public async getRoomUsers(roomIds: number[]): Promise<Pick<RoomUsersModel, "roomId" | "userId">[]> {
    // We should select roomModel instead of romUserModel, otherwise it will ignore deletedAt from roomModel
    return this.roomUsersModel.findAll({
      where: {
        roomId: {
          [Op.in]: roomIds,
        },
      },
      raw: true,
      attributes: ["userId", "roomId"],
    });
  }

  public async getUserRooms(userId: number): Promise<Pick<RoomUsersModel, "roomId" | "userId">[]> {
    return this.roomUsersModel.findAll({
      where: {
        userId,
      },
      raw: true,
      attributes: ["userId", "roomId"],
    });
  }

  public async getRoomsForUser(userId: number): Promise<GetRoomsForUser[]> {
    // We should select roomModel instead of romUserModel, otherwise it will ignore deletedAt from roomModel
    return await this.roomModel.findAll({
      raw: true,
      include: [
        {
          association: "roomUsers",
          where: {
            userId,
          },
        },
      ],
    }) as any as GetRoomsForUser[];

    /*
     *     FROM `room` AS `RoomModel`
     *          INNER JOIN `room_user` AS `roomUsers` ON `RoomModel`.`id` = `roomUsers`.`room_id` AND
     *                                                   (`roomUsers`.`deleted_at` IS NULL AND `roomUsers`.`user_id` = 2)
     * WHERE (`RoomModel`.`deleted_at` IS NULL);
     */
  }
}
