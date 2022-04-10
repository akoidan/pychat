import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import {Injectable} from '@nestjs/common';
import {Theme,} from '@/data/types/dto/dto';
import {UserModel} from '@/data/database/model/user.model';
import {
  LogLevel,
  logLevels
} from 'lines-logger'

@Injectable()
@Table({ tableName: 'user_settings'})
export class UserSettingsModel extends Model<UserSettingsModel> {

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
  })
  public id: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public suggestions: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public showWhenImTyping: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public embeddedYoutube: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  public highlightCode: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public messageSound: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public incomingFileCallSound: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  public onlineChangeMessages: boolean;

  @Column({
    type: DataType.ENUM(...Object.keys(logLevels)),
    allowNull: false,
    defaultValue: 'error',
  })
  public devtoolsLogs: LogLevel;

  @Column({
    type: DataType.ENUM(...Object.keys(Theme)),
    allowNull: false,
    defaultValue: Theme.COLOR_REG.valueOf(),
  })
  public theme: Theme;
}
