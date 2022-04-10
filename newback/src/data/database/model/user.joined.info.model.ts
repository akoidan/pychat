import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';
import {IpAddressModel} from '@/data/database/model/ip.address.model';

const uniqueUserJoinedInfoUserIdIpId = 'unique_user_joined_info_user_id_ip_id';

@Injectable()
@Table({tableName: 'user_joined_info'})
export class UserJoinedInfoModel extends Model<UserJoinedInfoModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Unique(uniqueUserJoinedInfoUserIdIpId)
  @ForeignKey(() => IpAddressModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public ipId: number;

  @Unique(uniqueUserJoinedInfoUserIdIpId)
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
