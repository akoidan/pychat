import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {UserModel} from '@/data/database/model/user.model';
import {UploadedFileChoices} from '@/data/types/model/db';

@Injectable()
@Table({paranoid: true, tableName: 'subscription', timestamps: true})
export class SubscriptionModel extends Model<SubscriptionModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
  })
  public registrationId: UploadedFileChoices;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public agent: string;


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  public isMobile: boolean;

  @ForeignKey(() => IpAdressModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public ipId: number;
}
