import {
  Column,
  DataType,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import {Injectable} from "@nestjs/common";
import {UserAuthModel} from "@/data/model/user.auth.model";
import {UserProfileModel} from "@/data/model/user.profile.model";
import {UserSettingsModel} from "@/data/model/user.settings.model";
import {MAX_USERNAME_LENGTH} from "@/data/consts";


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
@Table({tableName: "user"})
export class UserModel extends Model<UserModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public lastTimeOnline: number;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING(MAX_USERNAME_LENGTH),
  })
  public username: string;

  @HasOne(() => UserAuthModel, "id")
  public userAuth: UserAuthModel;

  @HasOne(() => UserProfileModel, "id")
  public userProfile: UserProfileModel;

  @HasOne(() => UserSettingsModel, "id")
  public userSettings: UserSettingsModel;

  @Column({
    type: DataType.ENUM(...Object.keys(Gender)),
    allowNull: false,
    defaultValue: Gender.OTHER.valueOf(),
  })
  public sex: Gender;

  @Column({
    allowNull: true,
    type: DataType.STRING(100),
    defaultValue: null,
  })
  public thumbnail: string;
}
