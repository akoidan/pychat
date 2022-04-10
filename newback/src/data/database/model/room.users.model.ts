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
import {
  ImageType,
  UploadedFileChoices,
  VerificationType
} from '@/data/types/model/db';
import {MessageModel} from '@/data/database/model/message.model';
import {RoomModel} from '@/data/database/model/room.model';

@Injectable()
@Table({ paranoid: true, tableName: 'room_user', timestamps: true })
export class UploadedFileModel extends Model<UploadedFileModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => RoomModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public roomId: number;

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
