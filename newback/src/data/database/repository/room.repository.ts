import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {UserModel} from '@/data/database/model/user.model';
import {UserAuthModel} from '@/data/database/model/user.auth.model';
import {SignUpRequest} from '@/data/types/dto/dto';
import {UserProfileModel} from '@/data/database/model/user.profile.model';
import {UserSettingsModel} from '@/data/database/model/user.settings.model';
import {RoomModel} from '@/data/database/model/room.model';
import {RoomUsersModel} from '@/data/database/model/room.users.model';


@Injectable()
export class RoomRepository {
  public constructor(
    @InjectModel(RoomModel) private readonly roomModel: typeof RoomModel,
    @InjectModel(RoomUsersModel) private readonly roomUsersModel: typeof RoomUsersModel,
  ) {
  }

  public async createRoomUser(roomId: number, userId: number) {
    await this.roomUsersModel.create({
      roomId,
      userId,
      notifications: false,
    })
  }
}
