import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';

@Injectable()
@Table({paranoid: true, tableName: 'user_auth', timestamps: true})
export class UserAuthModel extends Model<UserAuthModel> {

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  public password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  public email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  public facebookId: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    unique: true,
  })
  public googleId: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  public emailVerificationId: string;

}
