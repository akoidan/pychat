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
import {VerificationType} from '@/data/types/dto/dto';

@Injectable()
@Table({tableName: 'verification'})
export class VerificationModel extends Model<VerificationModel> {

  @Column({
    type: DataType.INTEGER,
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
    type: DataType.STRING(32),
    allowNull: false,
  })
  public token: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @BelongsTo(() => UserModel)
  public user: UserModel;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public verified: boolean;

  @Column({
    type: DataType.STRING(190),
    allowNull: true,
    unique: false,
  })
  public email: string;
}
