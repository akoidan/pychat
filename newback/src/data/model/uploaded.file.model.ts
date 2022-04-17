import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {ImageType} from "@/data/types/frontend";
import {UserModel} from "@/data/model/user.model";

@Injectable()
@Table({tableName: "uploaded_file"})
export class UploadedFileModel extends Model<UploadedFileModel> {
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

  @BelongsTo(() => UserModel)
  public user: UserModel;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public file: string;
}
