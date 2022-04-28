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
import {
  ALL_ROOM_ID,
  MAX_USERNAME_LENGTH,
} from "@/data/consts";
import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {FaceBookAuthRequest} from "@common/http/auth/facebook.auth";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {
  SignInRequest,
  SignInResponse,
} from "@common/http/auth/sign.in";
import {ImageType} from '@common/model/enum/image.type';
import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import {Theme} from '@common/model/enum/theme';
import {VerificationType} from '@common/model/enum/verification.type';

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
