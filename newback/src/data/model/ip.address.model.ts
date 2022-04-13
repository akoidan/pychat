import {
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';

@Injectable()
@Table({tableName: 'ip_address'})
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
    type: DataType.STRING,
    allowNull: true,
  })
  public isp: string;

  @Column({
    type: DataType.STRING(16),
    allowNull: true,
  })
  public countryCode: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public country: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public region: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  public city: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  public lat: number;
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  public lon: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
  })
  public zip: string;

  @Column({
    type: DataType.STRING(32),
    allowNull: true,
  })
  public timezone: string;


}
