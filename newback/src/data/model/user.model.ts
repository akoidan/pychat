import {
  Column,
  DataType,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {Gender} from '@/data/types/frontend';
import {UserAuthModel} from '@/data/model/user.auth.model';
import {MAX_USERNAME_LENGTH} from '@/utils/consts';
import {UserProfileModel} from '@/data/model/user.profile.model';
import {UserSettingsModel} from '@/data/model/user.settings.model';


@Injectable()
@Table({tableName: 'user'})
export class UserModel extends Model<UserModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public lastTimeOnline: number;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING(MAX_USERNAME_LENGTH),
  })
  public username: string;

  @HasOne(() => UserAuthModel, 'id')
  public userAuth: UserAuthModel;

  @HasOne(() => UserProfileModel, 'id')
  public userProfile: UserProfileModel;

  @HasOne(() => UserSettingsModel, 'id')
  public userSettings: UserSettingsModel;

  @Column({
    type: DataType.ENUM(...Object.keys(Gender)),
    allowNull: false,
    defaultValue: Gender.OTHER.valueOf(),
  })
  public sex: Gender;

  @Column({
    allowNull: true,
    type: DataType.STRING(100),
    defaultValue: null,
  })
  public thumbnail: string;
}
