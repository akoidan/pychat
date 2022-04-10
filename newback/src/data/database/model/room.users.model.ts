import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';
import {RoomModel} from '@/data/database/model/room.model';

const uniqueRoomUser = 'unique_room_user_room_id_user_id';

@Injectable()
@Table({tableName: 'room_user'})
export class RoomUsersModel extends Model<RoomUsersModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Unique(uniqueRoomUser)
  @ForeignKey(() => RoomModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public roomId: number;

  @Unique(uniqueRoomUser)
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 2,
    allowNull: false,
  })
  public volume: number;


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  public notifications: boolean;

}
