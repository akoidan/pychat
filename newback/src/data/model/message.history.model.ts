import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {MessageModel} from '@/data/model/message.model';


@Injectable()
@Table({tableName: 'message_history'})
export class MessageHistoryModel extends Model<MessageHistoryModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;


  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @BelongsTo(() => MessageModel)
  public message: MessageModel;

  @Column({
    allowNull: false,
    type: DataType.BIGINT,
  })
  public time: number;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: true, // idk but it contains null
  })
  public content: string;
}
