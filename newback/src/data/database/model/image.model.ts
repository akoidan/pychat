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
  UploadedFileChoices,
  VerificationType
} from '@/data/types/model/db';

@Injectable()
@Table({ paranoid: true, tableName: 'uploaded_file', timestamps: true })
export class UploadedFileModel extends Model<UploadedFileModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.ENUM(...Object.keys(UploadedFileChoices)),
    allowNull: false,
  })
  public type: UploadedFileChoices;

  @Column({
    type: DataType.STRING(1),
    allowNull: false,
  })
  public symbol: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public file: string;
}
