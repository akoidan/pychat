import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {ImageType} from '@/data/types/model/db';
import {MessageModel} from '@/data/database/model/message.model';

@Injectable()
@Table({paranoid: true, tableName: 'uploaded_file', timestamps: true})
export class UploadedFileModel extends Model<UploadedFileModel> {

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.ENUM(...Object.keys(ImageType)),
    allowNull: false,
  })
  public type: ImageType;

  @Column({
    type: DataType.STRING(1),
    allowNull: false,
  })
  public symbol: string;

  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public img: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public preview: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public absoluteUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public webpAsboluteUrl: string;
}
