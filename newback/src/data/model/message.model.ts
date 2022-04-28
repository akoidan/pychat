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
import {RoomModel} from "@/data/model/room.model";

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
@Table({tableName: "message"})
export class MessageModel extends Model<MessageModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  public id: number;


  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public senderId: number;

  @BelongsTo(() => UserModel)
  public sender: UserModel;

  @ForeignKey(() => RoomModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public roomId: number;

  @BelongsTo(() => RoomModel)
  public room: RoomModel;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  public time: number;

  @Column({
    type: DataType.TEXT("long"),
    allowNull: true,
  })
  public content: string;

  @Column({
    type: DataType.STRING(1),
    allowNull: true,
  })
  public symbol: string;

  @Column({
    type: DataType.ENUM(...Object.keys(MessageStatus)),
    allowNull: false,
  })
  public messageStatus: MessageStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  public threadMessageCount: number;


  @ForeignKey(() => MessageModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  public parentMessageId: number;

  @BelongsTo(() => MessageModel)
  public parentMessage: MessageModel;
}
