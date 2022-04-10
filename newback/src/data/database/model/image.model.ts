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
@Table({paranoid: true, tableName: 'image', timestamps: true})
export class ImageModel extends Model<ImageModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.ENUM(...Object.keys(UploadedFileChoices)),
    allowNull: false,
  })
  public type: UploadedFileChoices;

  @Column({
    type: DataType.STRING(1),
    allowNull: false,
  })
  public symbol: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public file: string;
}
