import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {MessageModel} from '@/data/model/message.model';
import {SubscriptionModel} from '@/data/model/subscription.model';

const uniqueSubscriptionMessage = 'unique_subscription_message_subscription_id_message_id';

@Injectable()
@Table({tableName: 'subscription_message'})
export class SubscriptionMessageModel extends Model<SubscriptionMessageModel> {

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Unique(uniqueSubscriptionMessage)
  @ForeignKey(() => SubscriptionModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public subscriptionId: number;

  @BelongsTo(() => SubscriptionModel)
  public subscription: SubscriptionModel;

  @Unique(uniqueSubscriptionMessage)
  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @BelongsTo(() => MessageModel)
  public message: MessageModel;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  public received: boolean;


}
