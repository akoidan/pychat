import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {
  ImageType,
  UploadedFileChoices
} from '@/data/types/dto/dto';
import {MessageModel} from '@/data/database/model/message.model';
import {UserModel} from '@/data/database/model/user.model';

@Injectable()
@Table({tableName: 'uploaded_file'})
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
