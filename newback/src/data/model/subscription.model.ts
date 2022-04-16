import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {UserModel} from "@/data/model/user.model";
import {UploadedFileChoices} from "@/data/types/frontend";
import {IpAddressModel} from "@/data/model/ip.address.model";
import {MysqlBool} from "@/data/types/internal";

@Injectable()
@Table({tableName: "subscription"})
export class SubscriptionModel extends Model<SubscriptionModel> {
  @Column({
    type: DataType.INTEGER,
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

  @BelongsTo(() => UserModel)
  public user: UserModel;

  @Column({
    type: DataType.STRING,
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
  public isMobile: MysqlBool;

  @ForeignKey(() => IpAddressModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public ipId: number;

  @BelongsTo(() => IpAddressModel)
  public ip: IpAddressModel;
}
