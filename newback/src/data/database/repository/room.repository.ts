import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {RoomModel} from '@/data/database/model/room.model';
import {RoomUsersModel} from '@/data/database/model/room.users.model';
import {Transaction} from 'sequelize';


@Injectable()
export class RoomRepository {
  public constructor(
    @InjectModel(RoomModel) private readonly roomModel: typeof RoomModel,
    @InjectModel(RoomUsersModel) private readonly roomUsersModel: typeof RoomUsersModel,
  ) {
  }

  public async createRoomUser(roomId: number, userId: number, transaction: Transaction): Promise<void> {
    await this.roomUsersModel.create({
      roomId,
      userId,
      notifications: false,
    }, {transaction})
  }
}
