import {
  ConsoleLogger,
  Module
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import {generateConfig } from '@/data/database/ormconfig';
import { Sequelize } from 'sequelize-typescript';
import {ChannelModel} from '@/data/database/model/channel.model';
import {ImageModel} from '@/data/database/model/image.model';
import {IpAddressModel} from '@/data/database/model/ip.address.model';
import {MessageHistoryModel} from '@/data/database/model/message.history.model';
import {MessageModel} from '@/data/database/model/message.model';
import {RoomModel} from '@/data/database/model/room.model';
import {RoomUsersModel} from '@/data/database/model/room.users.model';
import {MessageMentionModel} from '@/data/database/model/message.mention.model';
import {SubscriptionMessageModel} from '@/data/database/model/subscription.message.model';
import {SubscriptionModel} from '@/data/database/model/subscription.model';
import {UploadedFileModel} from '@/data/database/model/uploaded.file.model';
import {UserAuthModel} from '@/data/database/model/user.auth.model';
import {UserJoinedInfoModel} from '@/data/database/model/user.joined.info.model';
import {UserModel} from '@/data/database/model/user.model';
import {UserProfileModel} from '@/data/database/model/user.profile.model';
import {UserSettingsModel} from '@/data/database/model/user.settings.model';
import {VerificationModel} from '@/data/database/model/verification.model';
import {
  Logger,
  LoggerService
} from '@nestjs/common/services/logger.service';
import {LoggerModule} from '@/modules/logger/logger.module';

const repositories = [

];


@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [Logger],
      imports: [LoggerModule],
      useFactory: (logger: Logger) => generateConfig((sql) => logger.debug(sql)),
    }),
    SequelizeModule.forFeature([
     ChannelModel,
      ImageModel,
      IpAddressModel,
      MessageHistoryModel,
      MessageMentionModel,
      MessageModel,
      RoomModel,
      RoomUsersModel,
      SubscriptionMessageModel,
      SubscriptionModel,
      UploadedFileModel,
      UserAuthModel,
      UserJoinedInfoModel,
      UserModel,
      UserProfileModel,
      UserSettingsModel,
      VerificationModel,
    ]),
  ],
  providers: [...repositories],
  exports: [
    SequelizeModule,
    ...repositories,
  ],
})
export class DatabaseModule {
}
