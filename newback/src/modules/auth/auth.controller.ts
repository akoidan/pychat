import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import LoginRequestValidator from '@/modules/auth/interfaces';
import {Sequelize} from 'sequelize';
import {UserModel} from '@/data/database/model/user.model';
import {UserSettingsModel} from '@/data/database/model/user.settings.model';
import {ImageModel} from '@/data/database/model/image.model';
import {IpAddressModel} from '@/data/database/model/ip.address.model';
import {MessageHistoryModel} from '@/data/database/model/message.history.model';
import {MessageMentionModel} from '@/data/database/model/message.mention.model';
import {MessageModel} from '@/data/database/model/message.model';
import {RoomModel} from '@/data/database/model/room.model';
import {RoomUsersModel} from '@/data/database/model/room.users.model';
import {SubscriptionModel} from '@/data/database/model/subscription.model';
import {SubscriptionMessageModel} from '@/data/database/model/subscription.message.model';
import {UploadedFileModel} from '@/data/database/model/uploaded.file.model';
import {UserAuthModel} from '@/data/database/model/user.auth.model';
import {UserJoinedInfoModel} from '@/data/database/model/user.joined.info.model';
import {UserProfileModel} from '@/data/database/model/user.profile.model';
import {VerificationModel} from '@/data/database/model/verification.model';

@Controller()
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Post('/auth')
  public auth(@Body() body: LoginRequestValidator): string {
    return 'asd';
  }
}
