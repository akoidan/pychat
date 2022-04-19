import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {UserModel} from "@/data/model/user.model";
import {RoomModel} from "@/data/model/room.model";
import { MessageStatus } from '@/data/shared/enums';

@Injectable()
@Table({tableName: "message"})
export class MessageModel extends Model<MessageModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;


  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public senderId: number;

  @BelongsTo(() => UserModel)
  public sender: UserModel;

  @ForeignKey(() => RoomModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public roomId: number;

  @BelongsTo(() => RoomModel)
  public room: RoomModel;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public time: number;

  @Column({
    type: DataType.TEXT("long"),
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
    defaultValue: 0,
  })
  public threadMessageCount: number;


  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public parentMessageId: number;

  @BelongsTo(() => MessageModel)
  public parentMessage: MessageModel;
}
