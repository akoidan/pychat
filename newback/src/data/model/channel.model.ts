import {Injectable} from "@nestjs/common";
import {UserModel} from "@/data/model/user.model";

BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";


@Injectable()
@Table({tableName: "channel"})
export class ChannelModel extends Model<ChannelModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(16),
    allowNull: false,
  })
  public name: string;

  @ForeignKey(() => UserModel)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  public creatorId: number;

  @BelongsTo(() => UserModel)
  public creator: UserModel;
}
