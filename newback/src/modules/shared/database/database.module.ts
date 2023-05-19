import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";

import {ChannelModel} from "@/data/model/channel.model";
import {ImageModel} from "@/data/model/image.model";
import {IpAddressModel} from "@/data/model/ip.address.model";
import {MessageHistoryModel} from "@/data/model/message.history.model";
import {MessageModel} from "@/data/model/message.model";
import {RoomModel} from "@/data/model/room.model";
import {RoomUsersModel} from "@/data/model/room.users.model";
import {MessageMentionModel} from "@/data/model/message.mention.model";
import {SubscriptionMessageModel} from "@/data/model/subscription.message.model";
import {SubscriptionModel} from "@/data/model/subscription.model";
import {UploadedFileModel} from "@/data/model/uploaded.file.model";
import {UserAuthModel} from "@/data/model/user.auth.model";
import {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";
import {UserModel} from "@/data/model/user.model";
import {UserProfileModel} from "@/data/model/user.profile.model";
import {UserSettingsModel} from "@/data/model/user.settings.model";
import {VerificationModel} from "@/data/model/verification.model";
import {Logger} from "@nestjs/common/services/logger.service";
import {UserRepository} from "@/modules/shared/database/repository/user.repository";
import {RoomRepository} from "@/modules/shared/database/repository/room.repository";
import {IpRepository} from "@/modules/shared/database/repository/ip.repository";
import {VerificationRepository} from "@/modules/shared/database/repository/verification.repository";
import {MessageRepository} from "@/modules/shared/database/repository/messages.repository";
import {generateOrmConfig} from "@/utils/generate.orm.config";
import {HealthRepository} from "@/modules/shared/database/repository/health.repository";

const repositories = [
  UserRepository,
  RoomRepository,
  IpRepository,
  VerificationRepository,
  MessageRepository,
  HealthRepository,
];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [Logger],
      useFactory: (logger: Logger) => generateOrmConfig((sql) => {
        sql.length > 2000 ? logger.verbose(sql, "sql") : logger.debug(sql, "sql");
      }),
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