#!/usr/bin/yarn ts-node --compiler ttypescript ./src/utils/migration.old.ts

import {DatabaseModule} from "@/modules/rest/database/database.module";
import {ConsoleLogger} from "@nestjs/common";
import {UserModel} from "@/data/model/user.model";
import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {ConfigModule} from "@/modules/rest/config/config.module";
import {getModelToken} from "@nestjs/sequelize";
import {Sequelize} from "sequelize-typescript";
import {Gender} from "@/data/types/frontend";
import {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";
import {UserAuthModel} from "@/data/model/user.auth.model";
import {UserProfileModel} from "@/data/model/user.profile.model";
import {ChannelModel} from "@/data/model/channel.model";
import {ImageModel} from "@/data/model/image.model";
import {MessageModel} from "@/data/model/message.model";
import {MessageHistoryModel} from "@/data/model/message.history.model";
import {MessageMentionModel} from "@/data/model/message.mention.model";
import {RoomModel} from "@/data/model/room.model";
import {RoomUsersModel} from "@/data/model/room.users.model";
import {SubscriptionModel} from "@/data/model/subscription.model";
import {SubscriptionMessageModel} from "@/data/model/subscription.message.model";
import {UploadedFileModel} from "@/data/model/uploaded.file.model";
import {VerificationModel} from "@/data/model/verification.model";
import * as pychat_chat_channel from "@/fixtures/prod/pychat_chat_channel.json";
import * as pychat_chat_image from "@/fixtures/prod/pychat_chat_image.json";
import * as pychat_chat_ip_address from "@/fixtures/prod/pychat_chat_ip_address.json";
import * as pychat_chat_message from "@/fixtures/prod/pychat_chat_message.json";
import * as pychat_chat_messagehistory from "@/fixtures/prod/pychat_chat_messagehistory.json";
import * as pychat_chat_messagemention from "@/fixtures/prod/pychat_chat_messagemention.json";
import * as pychat_chat_room from "@/fixtures/prod/pychat_chat_room.json";
import * as pychat_chat_room_users from "@/fixtures/prod/pychat_chat_room_users.json";
import * as pychat_chat_subscription from "@/fixtures/prod/pychat_chat_subscription.json";
import * as pychat_chat_subscription_message from "@/fixtures/prod/pychat_chat_subscription_message.json";
import * as pychat_chat_uploadedfile from "@/fixtures/prod/pychat_chat_uploadedfile.json";
import * as pychat_chat_user_joined_info from "@/fixtures/prod/pychat_chat_user_joined_info.json";
import * as pychat_chat_user from "@/fixtures/prod/pychat_chat_user.json";
import * as pychat_chat_userprofile from "@/fixtures/prod/pychat_chat_userprofile.json";
import * as pychat_chat_verification from "@/fixtures/prod/pychat_chat_verification.json";
import {IpAddressModel} from "@/data/model/ip.address.model";


async function bootstrap() {
  const app = await Test.createTestingModule({
    imports: [
      {
        module: DatabaseModule,
        imports: [
          LoggerModule,
          ConfigModule,
          DatabaseModule,
        ],
      },

    ],
  }).setLogger(new ConsoleLogger()).
    compile();

  const userModel: typeof UserModel = app.get(getModelToken(UserModel));
  const userJoinedInfoModel: typeof UserJoinedInfoModel = app.get(getModelToken(UserJoinedInfoModel));
  const userAuthModel: typeof UserAuthModel = app.get(getModelToken(UserAuthModel));
  const userProfileModel: typeof UserProfileModel = app.get(getModelToken(UserProfileModel));
  const channelModel: typeof ChannelModel = app.get(getModelToken(ChannelModel));
  const imageModel: typeof ImageModel = app.get(getModelToken(ImageModel));
  const messageModel: typeof MessageModel = app.get(getModelToken(MessageModel));
  const messageHistoryModel: typeof MessageHistoryModel = app.get(getModelToken(MessageHistoryModel));
  const messageMentionModel: typeof MessageMentionModel = app.get(getModelToken(MessageMentionModel));
  const roomModel: typeof RoomModel = app.get(getModelToken(RoomModel));
  const roomUsersModel: typeof RoomUsersModel = app.get(getModelToken(RoomUsersModel));
  const subscriptionModel: typeof SubscriptionModel = app.get(getModelToken(SubscriptionModel));
  const subscriptionMessageModel: typeof SubscriptionMessageModel = app.get(getModelToken(SubscriptionMessageModel));
  const uploadedFileModel: typeof UploadedFileModel = app.get(getModelToken(UploadedFileModel));
  const verificationModel: typeof VerificationModel = app.get(getModelToken(VerificationModel));
  const ipAddressModel: typeof IpAddressModel = app.get(getModelToken(IpAddressModel));
  const sequelize = app.get(Sequelize);
  await sequelize.transaction(async(transaction) => {
    const users: UserModel[] = pychat_chat_user.map((a) => {
      const b: UserModel = {
        lastTimeOnline: a.last_time_online,
        username: a.username,
        id: a.id,
        sex: a.sex === 0 ? Gender.OTHER : a.sex === 1 ? Gender.MALE : Gender.FEMALE,
        thumbnail: a.thumbnail,
      } as any;
      return b;
    });
    await userModel.bulkCreate(users, {transaction});

    const channelModels = pychat_chat_channel.map((key) => {
      const result: ChannelModel = {
        id: key.id,
        name: key.name,
        deletedAt: key.disabled ? new Date() : null,
        creatorId: key.creator_id,
      } as any;
      return result;
    });
    await channelModel.bulkCreate(channelModels, {transaction});


    const ipaddress = pychat_chat_ip_address.map((key) => {
      const result: IpAddressModel = {
        id: key.id,
        ip: key.ip,
        status: true,
        isp: key.isp,
        countryCode: key.country_code,
        country: key.country,
        region: key.region,
        city: key.city,
        lat: key.lat,
        lon: key.lon,
        zip: key.zip,
        timezone: key.timezone,
      } as any;
      return result;
    });
    await ipAddressModel.bulkCreate(ipaddress, {transaction});

    const rooms = pychat_chat_room.map((key) => {
      const result: RoomModel = {
        id: key.id,
        name: key.name,
        deletedAt: key.disabled ? new Date() : null,
        channelId: key.channel_id,
        creatorId: key.creator_id,
        isMainInChannel: key.is_main_in_channel,
        p2p: key.p2p,
      } as any;
      return result;
    });
    await roomModel.bulkCreate(rooms, {transaction});

    const messaggs = pychat_chat_message.map((key) => {
      const result: MessageModel = {
        id: key.id,
        senderId: key.sender_id,
        roomId: key.room_id,
        time: key.time,
        content: key.content,
        symbol: key.symbol,
        messageStatus: {u: "ON_SERVER",
          r: "READ",
          s: "RECEIVED"}[key.message_status],
        threadMessageCount: key.thread_messages_count,
        parentMessageId: key.parent_message_id,
        updatedAt: new Date(key.updated_at),
      } as any;
      return result;
    });
    await messageModel.bulkCreate(messaggs, {transaction});


    const roomUsers = pychat_chat_room_users.map((key) => {
      const result: RoomUsersModel = {
        id: key.id,
        roomId: key.room_id,
        userId: key.user_id,
        notifications: key.notifications,
        volume: key.volume,
      } as any;
      return result;
    });
    await roomUsersModel.bulkCreate(roomUsers, {transaction});

    const subscriptions = pychat_chat_subscription.map((key) => {
      const result: SubscriptionModel = {
        id: key.id,
        userId: key.user_id,
        registrationId: key.registration_id,
        agent: key.agent,
        updatedAt: new Date(key.updated),
        isMobile: key.is_mobile,
        ipId: key.ip_id,
        createdAt: new Date(key.created),
        deletedAt: key.inactive ? new Date() : null,
      } as any;
      return result;
    });
    await subscriptionModel.bulkCreate(subscriptions, {transaction});

    const uploadedFIles = pychat_chat_uploadedfile.map((key) => {
      const result: UploadedFileModel = {
        id: key.id,
        type: {v: "VIDEO",
          i: "IMAGE",
          f: "FILE"}[key.type],
        symbol: key.symbol,
        userId: key.user_id,
        file: key.file,
      } as any;
      return result;
    });
    await uploadedFileModel.bulkCreate(uploadedFIles, {transaction});

    const userJoinedInfo = pychat_chat_user_joined_info.map((key) => {
      const result: UserJoinedInfoModel = {
        id: key.id,
        createdAt: new Date(key.time),
        ipId: key.ip_id,
        userId: key.user_id,
      } as any;
      return result;
    });
    await userJoinedInfoModel.bulkCreate(userJoinedInfo, {transaction});


    const verifications = pychat_chat_verification.map((key) => {
      const result: VerificationModel = {
        id: key.id,
        type: {
          r: "REGISTER",
          p: "PASSWORD",
          c: "EMAIL",
        }[key.type],
        token: key.token,
        createdAt: new Date(key.time),
        verified: key.verified,
        userId: key.user_id,
        email: key.email,
      } as any;
      return result;
    });
    await verificationModel.bulkCreate(verifications, {transaction});

    const auth = pychat_chat_userprofile.map((u) => ({...u,
      ...pychat_chat_user.find((us) => us.id == u.user_ptr_id)})).map((key) => {
      const result: UserAuthModel = {
        id: key.id,
        password: key.password,
        email: key.email,
        facebookId: key.facebook_id,
        googleId: key.google_id,
        emailVerificationId: key.email_verification_id,
      } as any;
      return result;
    });
    await userAuthModel.bulkCreate(auth, {transaction});


    const userProf = pychat_chat_userprofile.map((u) => ({...u,
      ...pychat_chat_user.find((us) => us.id == u.user_ptr_id)})).map((key) => {
      const result: UserProfileModel = {
        id: key.id,
        name: key.name,
        city: key.city,
        surname: key.surname,
        birthday: new Date(key.birthday),
        contacts: key.contacts,
      } as any;
      return result;
    });
    await userProfileModel.bulkCreate(userProf, {transaction});

    const mentions = pychat_chat_messagemention.map((key) => {
      const result: MessageMentionModel = {
        id: key.id,
        symbol: key.symbol,
        messageId: key.message_id,
        userId: key.user_id,
      } as any;
      return result;
    });
    await messageMentionModel.bulkCreate(mentions, {transaction});


    const subMessage = pychat_chat_subscription_message.map((key) => {
      const result: SubscriptionMessageModel = {
        id: key.id,
        subscriptionId: key.subscription_id,
        messageId: key.message_id,
        received: key.received,
      } as any;
      return result;
    });
    await subscriptionMessageModel.bulkCreate(subMessage, {transaction});

    const imageModels = pychat_chat_image.map((key) => {
      const result: ImageModel = {
        id: key.id,
        type: {
          i: "IMAGE",
          v: "VIDEO",
          m: "MEDIA_RECORD",
          a: "AUDIO_RECORD",
          f: "FILE",
          g: "GIPHY",
        }[key.type],
        symbol: key.symbol,
        messageId: key.message_id,
        img: key.img,
        preview: key.preview,
        absoluteUrl: key.absolute_url,
        webpAsboluteUrl: key.webp_absolute_url,
      } as any;
      return result;
    });
    await imageModel.bulkCreate(imageModels, {transaction});


    const histories = pychat_chat_messagehistory.map((key) => {
      const result: MessageHistoryModel = {
        id: key.id,
        messageId: key.message_id,
        time: key.time,
        content: key.content,
      } as any;
      return result;
    });
    await messageHistoryModel.bulkCreate(histories, {transaction});
  });
}

bootstrap();

