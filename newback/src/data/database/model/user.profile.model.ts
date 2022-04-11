import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';

@Injectable()
@Table({ tableName: 'user_profile'})
export class UserProfileModel extends Model<UserProfileModel> {

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    autoIncrement: false,
    primaryKey: true,
  })
  public id: number;

  @BelongsTo(() => UserModel)
  public user: UserModel;

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
    allowNull: true,
  })
  public birthday: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  public contacts: string;
}
