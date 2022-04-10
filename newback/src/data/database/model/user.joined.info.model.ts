import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';
import {IpAddressModel} from '@/data/database/model/ip.address.model';

@Injectable()
@Table({paranoid: true, tableName: 'user_joined_info', timestamps: true})
export class UserJoinedInfoModel extends Model<UserJoinedInfoModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => IpAddressModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public ipId: number;

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

}
