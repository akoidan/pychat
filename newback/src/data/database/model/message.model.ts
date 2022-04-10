import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {MessageStatus,} from '@/data/types/dto/dto';
import {UserModel} from '@/data/database/model/user.model';
import {RoomModel} from '@/data/database/model/room.model';
import {config} from 'node-config-ts';

@Injectable()
@Table({paranoid: true, tableName: 'message', timestamps: true})
export class MessageModel extends Model<MessageModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public id: number;


  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public senderId: number;

  @ForeignKey(() => RoomModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public roomId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public time: Date;

  @Column({
    type: DataType.STRING(config.frontend.maxMessageSize),
    allowNull: true,
  })
  public content: string;

  @Column({
    type: DataType.STRING(1),
    allowNull: true,
  })
  public symbol: string;

  @Column({
    type: DataType.ENUM(...Object.keys(MessageStatus)),
    allowNull: false,
  })
  public messageStatus: MessageStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  public threadMessageCount: number;


  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public parentMessageId: number;
}
