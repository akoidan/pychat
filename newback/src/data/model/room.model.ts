import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/model/user.model';
import {ChannelModel} from '@/data/model/channel.model';


// 	constraint admin_should_not_be_define_for_private_rooms
// 		check (`creator_id` is null or `name` is not null),
// 	constraint channel_should_exist_for_public_room_and_not_exist_for_private
// 		check (`channel_id` is null and `name` is null or `channel_id` is not n),
// 	constraint p2p_only_if_private
// 		check (`p2p` = 0x00 or `name` is null)
@Injectable()
@Table({tableName: 'room'})
export class RoomModel extends Model<RoomModel> {

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;


  @Column({
    type: DataType.STRING(16),
    allowNull: true,
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

  @BelongsTo(() => ChannelModel)
  public channel: ChannelModel;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  public creatorId: number | null;

  @BelongsTo(() => UserModel)
  public creator: UserModel | null;
}
