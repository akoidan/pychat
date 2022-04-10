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
import {MessageModel} from '@/data/database/model/message.model';

const uniqueUserIdSymbMess = 'unique_message_mention_user_id_symbol_message_id';

@Injectable()
@Table({
  tableName: 'message_mention',
})
export class MessageMentionModel extends Model<MessageMentionModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @ForeignKey(() => UserModel)
  @Unique(uniqueUserIdSymbMess)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  public userId: string;

  @ForeignKey(() => MessageModel)
  @Unique(uniqueUserIdSymbMess)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  public messageId: string;

  @Unique(uniqueUserIdSymbMess)
  @Column({
    type: DataType.STRING(1),
    allowNull: false
  })
  public symbol: string;
}
