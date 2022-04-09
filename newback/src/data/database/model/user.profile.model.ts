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
@Table({ paranoid: true, tableName: 'user_profile', timestamps: true })
export class UserProfileModel extends Model<UserProfileModel> {

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(30),
    allowNull: true
  })
  public name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  public city: string;

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
