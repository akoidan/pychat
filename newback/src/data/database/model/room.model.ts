import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import {
  Gender,
  ThemeValues
} from '@/data/types/dto/dto';
import {UserModel} from '@/data/database/model/user.model';
import {
  LogLevel,
  logLevels
} from 'lines-logger'
import {VerificationType} from '@/data/types/model/db';
import {ChannelModel} from '@/data/database/model/channel.model';


// constraints = [
// 	CheckConstraint(
// 		check=Q(Q(channel__isnull=True) & Q(name__isnull=True)) | Q(channel__isnull=False) & Q(name__isnull=False),
// 		name='channel_should_exist_for_public_room_and_not_exist_for_private'
// 	),
// 	CheckConstraint(
// 		check=Q(creator__isnull=True) | Q(name__isnull=False),
// 		name='admin_should_not_be_define_for_private_rooms'
// 	),
// 	CheckConstraint(
// 		check=Q(p2p=False) | Q(name__isnull=True),
// 		name='p2p_only_if_private'
// 	)
// ]
@Injectable()
@Table({ paranoid: true, tableName: 'room', timestamps: true })
export class RoomModel extends Model<RoomModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;


  @Column({
    type: DataType.STRING(16),
    allowNull: false,
  })
  public name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public isMainInChannel: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public p2p: boolean;

  @ForeignKey(() => ChannelModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  public channelId: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  public creatorId: number;
}
