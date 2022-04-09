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

@Injectable()
@Table({
  paranoid: true,
  tableName: 'message_mention',
  timestamps: true,
  co
})
export class MessageMention extends Model<MessageMention> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  public userId: string;

  @Column({
    type: DataType.STRING(1),
    allowNull: false
  })
  public symbol: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: true
  })
  public surname: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public birthday: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  public contacts: string;
}
