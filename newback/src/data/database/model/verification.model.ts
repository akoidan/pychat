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

@Injectable()
@Table({ paranoid: true, tableName: 'verification', timestamps: true })
export class VerificationModel extends Model<VerificationModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.ENUM(...Object.keys(VerificationType)),
    allowNull: false,
  })
  public type: VerificationType;

  @Column({
    type: DataType.STRING(17),
    allowNull: false,
  })
  public token: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public time: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public verified: Date;

  @Column({
    type: DataType.STRING(190),
    allowNull: true,
    unique: false,
    defaultValue: false,
  })
  public email: string;
}
