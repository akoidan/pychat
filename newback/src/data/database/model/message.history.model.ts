import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {config} from 'node-config-ts';
import {MessageModel} from '@/data/database/model/message.model';


@Injectable()
@Table({tableName: 'message_history'})
export class MessageHistoryModel extends Model<MessageHistoryModel> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public id: number;


  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  public time: Date;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: false,
  })
  public content: string;
}