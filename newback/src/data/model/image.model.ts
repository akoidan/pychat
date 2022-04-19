import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {MessageModel} from "@/data/model/message.model";
import { ImageType } from '@/data/model/enums';

const uniqueUserIdSymbMess = "unique_image_symbol_message";


@Injectable()
@Table({tableName: "image"})
export class ImageModel extends Model<ImageModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.ENUM(...Object.keys(ImageType)),
    allowNull: false,
  })
  public type: ImageType;

  @Unique(uniqueUserIdSymbMess)
  @Column({
    type: DataType.STRING(1),
    allowNull: false,
  })
  public symbol: string;

  @Unique(uniqueUserIdSymbMess)
  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public messageId: number;

  @BelongsTo(() => MessageModel)
  public message: MessageModel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public img: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public preview: string;
}
