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
import {VerificationModel} from '@/data/database/model/verification.model';

@Injectable()
@Table({ tableName: 'user_auth'})
export class UserAuthModel extends Model<UserAuthModel> {

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

  @ForeignKey(() => VerificationModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public emailVerificationId: number;

  @BelongsTo(() => VerificationModel)
  public emailVerification: VerificationModel;
}
