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
import {
  LogLevel,
  logLevels,
} from "lines-logger";
import {MysqlBool} from "@/data/types/internal";
import { Theme } from '@/data/model/enums';

@Injectable()
@Table({tableName: "user_settings"})
export class UserSettingsModel extends Model<UserSettingsModel> {
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  public id: number;

  @BelongsTo(() => UserModel)
  public user: UserModel;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public suggestions: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public showWhenITyping: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public embeddedYoutube: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public highlightCode: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public messageSound: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public incomingFileCallSound: MysqlBool;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public onlineChangeSound: MysqlBool;

  @Column({
    type: DataType.ENUM(...Object.keys(logLevels)),
    allowNull: false,
    defaultValue: "error",
  })
  public logs: LogLevel;

  @Column({
    type: DataType.ENUM(...Object.keys(Theme)),
    allowNull: false,
    defaultValue: Theme.COLOR_REG.valueOf(),
  })
  public theme: Theme;
}
