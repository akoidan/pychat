import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {RoomModel} from '@/data/model/room.model';
import {RoomUsersModel} from '@/data/model/room.users.model';
import {
  Op,
  Transaction
} from 'sequelize';
import {ChannelModel} from '@/data/model/channel.model';

type RoomSingleRoomUser = Omit<RoomModel, 'roomUsers'>;
export interface GetRoomsForUser extends RoomSingleRoomUser {
  roomUsers: RoomUsersModel;
}

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
    }, {transaction, raw: true})
  }

  public async getAllChannels(ids: number[]): Promise<ChannelModel[]> {
    return await this.channelsModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        }
      }
    });
  }

    public async getRoomUsers(roomIds: number[]): Promise<Pick<RoomUsersModel, 'roomId'|'userId'>[]> {
     // we should select roomModel instead of romUserModel, otherwise it will ignore deletedAt from roomModel
     return  this.roomUsersModel.findAll({
       where: {
         roomId: {
           [Op.in]: roomIds,
         }
       },
       raw: true,
       attributes: ['userId', 'roomId']
     });
  }



  public async getRoomsForUser(userId: number): Promise<GetRoomsForUser[]> {
     // we should select roomModel instead of romUserModel, otherwise it will ignore deletedAt from roomModel
     return await this.roomModel.findAll({
      raw: true,
      include: [{
        association: 'roomUsers',
        where: {
           userId: userId
        }
      }],
    }) as any as GetRoomsForUser[];
    //     FROM `room` AS `RoomModel`
    //          INNER JOIN `room_user` AS `roomUsers` ON `RoomModel`.`id` = `roomUsers`.`room_id` AND
    //                                                   (`roomUsers`.`deleted_at` IS NULL AND `roomUsers`.`user_id` = 2)
    // WHERE (`RoomModel`.`deleted_at` IS NULL);
  }
}
