import {
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {MysqlBool} from "@/data/types/internal";

@Injectable()
@Table({tableName: "ip_address"})
export class IpAddressModel extends Model<IpAddressModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.STRING(32),
    unique: true,
    allowNull: false,
  })
  public ip: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  public status: MysqlBool;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public isp: string | null;

  @Column({
    type: DataType.STRING(16),
    allowNull: true,
  })
  public countryCode: string | null;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public country: string | null;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public region: string | null;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public city: string | null;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  public lat: number | null;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  public lon: number | null;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
  })
  public zip: string | null;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
  })
  public timezone: string | null;
}
