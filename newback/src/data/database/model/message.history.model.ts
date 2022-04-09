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
import {UserModel} from '@/data/database/model/user.model';
import {config} from 'node-config-ts';
import {MessageModel} from '@/data/database/model/message.model';


@Injectable()
@Table({ paranoid: true, tableName: 'message_history', timestamps: true })
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
    type: DataType.STRING(config.frontend.maxMessageSize),
    allowNull: false,
  })
  public content: string;
}
