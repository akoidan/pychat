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

import {generateUserName} from "@/data/transformers/helper/generate.user.name";
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
