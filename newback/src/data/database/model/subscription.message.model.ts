import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {MessageModel} from '@/data/database/model/message.model';
import {SubscriptionModel} from '@/data/database/model/subscription.model';

@Injectable()
@Table({paranoid: true, tableName: 'room_user', timestamps: true})
export class SubscriptionMessageModel extends Model<SubscriptionMessageModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => SubscriptionModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public subscriptionId: number;

  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 2,
    allowNull: false,
  })
  public volume: number;


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  public notifications: boolean;

}
