import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {Gender} from '@/data/types/dto/dto';
import {config} from 'node-config-ts';


@Injectable()
@Table({paranoid: true, tableName: 'user', timestamps: true})
export class UserModel extends Model<UserModel> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public lastLogin: Date;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING(config.frontend.maxUserNameLength),
  })
  public username: string;

  @Column({
    type: DataType.ENUM(...Object.keys(Gender)),
    allowNull: false,
    defaultValue: Gender.OTHER,
  })
  public sex: Gender;

  @Column({
    allowNull: true,
    defaultValue: null,
  })
  public thumbnail: string;
}
