import type {GiphyDto} from "@common/model/dto/giphy.dto";
import type {RoomNoUsersDto} from "@common/model/dto/room.dto";
import type {
  UserProfileDto,
  UserProfileDtoWoImage,
} from "@common/model/dto/user.profile.dto";
import type {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import type {MessageStatus} from "@common/model/enum/message.status";
import type {MessagesResponseMessage} from "@common/model/ws.base";
import type {AddChannelWsInMessage} from "@common/ws/message/room/add.channel";
import type {AddInviteWsInMessage} from "@common/ws/message/room/add.invite";
import type {AddRoomWsInMessage, AddRoomWsInBody} from "@common/ws/message/room/add.room";
import type {SaveChannelSettingsWsInMessage} from "@common/ws/message/room/save.channel.settings";
import type {ShowITypeWsOutMessage} from "@common/ws/message/room/show.i.type";

import type {PingWsInMessage} from "@common/ws/message/ws/ping";
import {PingWsInBody} from "@common/ws/message/ws/ping";
import type {SetProfileImageWsInMessage} from "@common/ws/message/ws/set.profile.image";
import {SetProfileImageWsInBody} from "@common/ws/message/ws/set.profile.image";
import type {
  SetSettingsMessage,
  SetSettingsWsOutMessage,
} from "@common/ws/message/ws/set.settings";
import {SetSettingBody} from "@common/ws/message/ws/set.settings";
import type {
  SetUserProfileMessage,
  SetUserProfileWsOutMessage,
} from "@common/ws/message/ws/set.user.profile";
import {SetUserProfileBody} from "@common/ws/message/ws/set.user.profile";
import type {SetWsIdWsInMessage} from "@common/ws/message/ws/set.ws.id";
import {SetWsIdBody} from "@common/ws/message/ws/set.ws.id";
import type {UserProfileChangedWsInMessage} from "@common/ws/message/ws/user.profile.changed";
import {UserProfileChangedWsInBody} from "@common/ws/message/ws/user.profile.changed";
import type {
  GetCountryCodeWsInBody,
  GetCountryCodeWsInMessage,
  GetCountryCodeWsOutMessage,
} from "@common/ws/message/get.country.code";
import type {SetMessageStatusWsOutMessage} from "@common/ws/message/set.message.status";
import type {
  SyncHistoryWsInMessage,
  SyncHistoryWsOutMessage,
} from "@common/ws/message/sync.history";
import type {DefaultWsOutMessage} from "@common/ws/common";
import {WS_SESSION_EXPIRED_CODE} from "@common/consts";
import type {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";
import type {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";

import {
  CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT,
  CONNECTION_RETRY_TIME,
  FLAGS,
  IS_DEBUG,
  LOG_LEVEL_LS,
} from "@/ts/utils/consts";
import type {
  Logger,
  LogLevel,
} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {
  CurrentUserInfoWoImage,
  CurrentUserSettingsModel,
  Location,
} from "@/ts/types/model";
import type {
  MessageSupplier,
  SessionHolder,
} from "@/ts/types/types";
import {
  convertLocation,
  currentUserInfoDtoToModel,
  userSettingsDtoToModel,
} from "@/ts/types/converters";

import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {WsMessageProcessor} from "@/ts/message_handlers/WsMessageProcessor";


import type Subscription from "@/ts/classes/Subscription";
import {Subscribe} from "@/ts/utils/pubsub";
import type {
  PongWsInMessage,
  PongWsOutMessage,
} from "@common/ws/message/ws/pong";
import type {
  OfferFileRequest,
  OfferFileResponse,
} from "@common/ws/message/webrtc/offer.file";
import type {
  OfferCallRequestWsOutMessage,
  OfferCallResponseWsInMessage,
} from "@common/ws/message/webrtc/offer.call";
import type {AcceptFileWsOutMessage} from "@common/ws/message/webrtc-transfer/accept.file";
import type {DestroyCallConnectionWsOutMessage} from "@common/ws/message/peer-connection/destroy.call.connection";
import {WsState} from "@/ts/types/model";
import type {WebRtcSetConnectionIdBody} from "@common/model/webrtc.base";
import type {PrintMessageWsInMessage,
  PrintMessageWsOutMessage,
  PrintMessageWsOutBody} from "@common/ws/message/ws-message/print.message";
import {AddRoomWsOutBody} from "@common/ws/message/room/add.room";
import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";


export default class WsApi implements MessageSupplier {
  protected readonly logger: Logger;

  /*
   * How much current time is ahead of the server time
   * if current time is in the past it will be negative
   */
  private timeDiffWithServer: number = 0;

  private pingTimeoutFunction: number | null = null;

  private readonly store: DefaultStore;

  private readonly sessionHolder: SessionHolder;

  private readonly wsMessageProcessor: WsMessageProcessor;

  private readonly sub: Subscription;

  public constructor(API_URL: string, sessionHolder: SessionHolder, store: DefaultStore, sub: Subscription) {
    this.sub = sub;
    this.sub.subscribe("ws", this);
    this.wsMessageProcessor = new WsMessageProcessor(API_URL, store, "ws", sub);
    this.logger = loggerFactory.getLoggerColor("ws", "#4c002b");
    this.sessionHolder = sessionHolder;
    this.store = store;
  }


  public async getCountryCode(): Promise<GetCountryCodeWsInBody> {
    return this.wsMessageProcessor.sendToServerAndAwait<GetCountryCodeWsOutMessage, GetCountryCodeWsInMessage>({
      action: "getCountryCode",
      data: null,
    });
  }

  public async offerFile(roomId: number, browser: string, name: string, size: number, threadId: number | null): Promise<WebRtcSetConnectionIdBody> {
    return this.wsMessageProcessor.sendToServerAndAwait<OfferFileRequest, OfferFileResponse>({
      action: "offerFile",
      data: {
        roomId,
        threadId,
        name,
        size,
        browser,
      },
    });
  }

  public async offerCall(roomId: number, browser: string): Promise<WebRtcSetConnectionIdBody> {
    return this.wsMessageProcessor.sendToServerAndAwait<OfferCallRequestWsOutMessage, OfferCallResponseWsInMessage>({
      action: "offerCall",
      data: {
        roomId,
        browser,
      },
    });
  }

  public acceptFile(connId: string, received: number) {
    this.sendToServer<AcceptFileWsOutMessage>({
      action: "acceptFile",
      data: {
        connId,
        received,
      },
    });
  }

  public replyFile(connId: string, browser: string) {
    this.sendToServer({
      action: "replyFile",
      connId,
      content: {browser},
    });
  }

  public destroyFileConnection(connId: string, content: unknown) {
    this.sendToServer({
      content,
      action: "destroyFileConnection",
      connId,
    });
  }

  public destroyPeerFileConnection(connId: string, content: any, opponentWsId: string) {
    this.sendToServer({
      content,
      opponentWsId,
      action: "destroyFileConnection",
      connId,
    });
  }

  public async search(
    searchString: string,
    roomId: number,
    offset: number,
  ): Promise<MessagesResponseMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      searchString,
      roomId,
      offset,
      action: "searchMessages",
    });
  }

  public sendEditMessage(
    content: string | null,
    id: number,
    files: number[] | null,
    tags: Record<string, number>,
    giphies: GiphyDto[],
  ) {
    const newVar = {
      id,
      action: "editMessage",
      files,
      tags,
      giphies,
      content,
    };
    this.sendToServer(newVar, true);
  }

  public async sendPrintMessage(
    data: PrintMessageWsOutBody,
  ): Promise<PrintMessageWsInMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait<PrintMessageWsOutMessage, PrintMessageWsInMessage>({
      action: "printMessage",
      data,
    });
  }

  public async saveSettings(content: UserSettingsDto): Promise<SetSettingsMessage | unknown> {
    return this.wsMessageProcessor.sendToServerAndAwait<SetSettingsWsOutMessage, SetSettingsMessage>({
      action: "setSettings",
      data: content,
    });
  }

  public showIType(roomId: number): void {
    this.sendToServer<ShowITypeWsOutMessage>({
      action: "showIType",
      data: {
        roomId,
      },
    });
  }

  public async saveUser(data: UserProfileDtoWoImage): Promise<SetUserProfileBody> {
    return this.wsMessageProcessor.sendToServerAndAwait<SetUserProfileWsOutMessage, SetUserProfileMessage>({
      action: "setUserProfile",
      data,
    });
  }

  public async sendAddRoom(data: AddRoomWsOutBody): Promise<AddRoomWsInBody> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      data,
      action: "addRoom",
    });
  }

  public async syncHistory(
    roomIds: number[],
    messagesIds: number[],
    receivedMessageIds: number[],
    onServerMessageIds: number[],
    lastSynced: number,
  ): Promise<SyncHistoryWsInMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait<SyncHistoryWsOutMessage, "syncHistory">({
      messagesIds,
      receivedMessageIds,
      onServerMessageIds,
      roomIds,
      lastSynced,
      action: "syncHistory",
    });
  }

  public async sendAddChannel(channelName: string, users: number[]): Promise<AddChannelWsInMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      channelName,
      users,
      action: "addChannel",
    });
  }

  public async sendRoomSettings(message: RoomNoUsersDto): Promise<void> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      ...message,
      action: "saveRoomSettings",
    });
  }

  public async sendDeleteChannel(channelId: number): Promise<unknown> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      channelId,
      action: "deleteChannel",
    });
  }

  public async sendLeaveChannel(channelId: number): Promise<unknown> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      channelId,
      action: "leaveChannel",
    });
  }

  public async saveChannelSettings(
    channelName: string,
    channelId: number,
    channelCreatorId: number,
    volume: number,
    notifications: boolean,
  ): Promise<SaveChannelSettingsWsInMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      action: "saveChannelSettings",
      channelId,
      channelCreatorId,
      channelName,
      volume,
      notifications,
    });
  }

  public async inviteUser(roomId: number, users: number[]): Promise<AddInviteWsInMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      roomId,
      users,
      action: "inviteUser",
    });
  }


  public pingServer() {
    this.sendToServer({action: "ping"}, true);
  }

  public async sendDeleteRoom(roomId: number) {
    return this.wsMessageProcessor.sendToServerAndAwait({
      roomId,
      action: "deleteRoom",
    });
  }

  public async sendLeaveRoom(roomId: number) {
    return this.wsMessageProcessor.sendToServerAndAwait({
      roomId,
      action: "leaveUser",
    });
  }

  public async setMessageStatus(
    messagesIds: number[],
    roomId: number,
    status: MessageStatus,
  ) {
    return this.wsMessageProcessor.sendToServerAndAwait<SetMessageStatusWsOutMessage, "setMessageStatus">({
      messagesIds,
      action: "setMessageStatus",
      status,
      roomId, // This room event will be published to
    });
  }

  public async sendLoadMessages(
    roomId: number,
    count: number,
    threadId: number | null,
    excludeIds: number[],
  ): Promise<MessagesResponseMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      count,
      excludeIds,
      threadId,
      action: "loadMessages",
      roomId,
    });
  }

  public async sendLoadMessagesByIds(
    roomId: number,
    messagesIds: number[],
  ): Promise<MessagesResponseMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      messagesIds,
      action: "loadMessagesByIds",
      roomId,
    });
  }



  public sendRtcData(content: RTCIceCandidate | RTCSessionDescriptionInit, connId: string, opponentWsId: string) {
    this.sendToServer({
      content,
      connId,
      opponentWsId,
      action: "sendRtcData",
    });
  }

  public retry(connId: string, opponentWsId: string) {
    this.sendToServer({
      action: "retryFile",
      connId,
      opponentWsId,
    });
  }

  public replyCall(connId: string, browser: string) {
    this.sendToServer({
      action: "replyCall",
      connId,
      content: {
        browser,
      },
    });
  }

  public destroyCallConnection(connId: string, status: "decline" | "hangup") {
    this.sendToServer<DestroyCallConnectionWsOutMessage>({
      action: "destroyCallConnection",
      data: {
        status,
        connId,
      },
    });
  }

  public async offerMessageConnection(roomId: number): Promise<WebRtcSetConnectionIdMessage> {
    return this.wsMessageProcessor.sendToServerAndAwait({
      action: "offerMessage",
      roomId,
    });
  }

  public acceptCall(connId: string) {
    this.sendToServer({
      action: "acceptCall",
      connId,
    });
  }

  public joinCall(connId: string) {
    this.sendToServer({
      action: "joinCall",
      connId,
    });
  }

  @Subscribe<SetSettingsMessage>()
  public setSettings(settings: SetSettingBody) {
    const a: CurrentUserSettingsModel = userSettingsDtoToModel(settings);
    this.setUserSettings(a);
  }


  @Subscribe<SetUserProfileMessage>()
  public setUserProfile(m: SetUserProfileBody) {
    const a: CurrentUserInfoWoImage = currentUserInfoDtoToModel(m);
    a.id = this.store.userInfo!.id; // This could came only when we logged in
    this.store.setUserInfo(a);
  }

  @Subscribe<SetProfileImageWsInMessage>()
  public setProfileImage(m: SetProfileImageWsInBody) {
    this.setUserImage(m.url);
  }

  public convertServerTimeToPC(serverTime: number) {
    return serverTime + this.timeDiffWithServer; // ServerTime + (Date.now - serverTime) === Date.now
  }


  @Subscribe<SetWsIdWsInMessage>()
  public async setWsId(message: SetWsIdBody) {
    this.wsMessageProcessor.setWsConnectionId(message.opponentWsId);
    this.setUserInfo(message.profile);
    this.setUserSettings(message.settings);
    this.setUserImage(message.profile.thumbnail);
    this.timeDiffWithServer = Date.now() - message.time;
    this.sub.notify<PubSetRoomsMessage>({
      action: "init",
      data: {
        channels: message.channels,
        rooms: message.rooms,
        online: message.online,
        users: message.users,
      },
      handler: "room",
    });

    this.sub.notify<InternetAppearMessage>({
      action: "internetAppear",
      handler: "*",
      data: null,
    });
    this.logger.debug("CONNECTION ID HAS BEEN SET TO {})", this.wsConnectionId)();
    if (FLAGS) {
      const getCountryCodeMessage = await this.getCountryCode();
      const modelLocal: Record<string, Location> = {};
      Object.entries(getCountryCodeMessage.content).forEach(([k, v]) => {
        modelLocal[k] = convertLocation(v);
      });
      this.store.setCountryCode(modelLocal);
    }
  }

  @Subscribe<UserProfileChangedWsInMessage>()
  public userProfileChanged(message: UserProfileChangedWsInBody) {
    this.store.setUser(message);
  }


  @Subscribe<PingWsInMessage>()
  public ping(message: PingWsInBody) {
    this.wsMessageProcessor.startNoPingTimeout();
    this.sendToServer<PongWsOutMessage>({
      action: "pong",
      data: {
        time: message.time,
      },
    });
  }

  @Subscribe<PongWsInMessage>()
  public pong() {
    if (this.pingTimeoutFunction) {
      this.logger.debug("Clearing pingTimeoutFunction")();
      clearTimeout(this.pingTimeoutFunction);
      this.pingTimeoutFunction = null;
    }
  }

  notifyCallActive(param: {connectionId: string | null; opponentWsId: string; roomId: number}) {
    this.sendToServer({
      action: "notifyCallActive",
      connId: param.connectionId,
      opponentWsId: param.opponentWsId,
      roomId: param.roomId,
    });
  }

  private setUserInfo(userInfo: UserProfileDto) {
    const um: CurrentUserInfoWoImage = currentUserInfoDtoToModel(userInfo);
    this.store.setUserInfo(um);
  }

  private setUserSettings(userInfo: UserSettingsDto) {
    const um: UserSettingsDto = userSettingsDtoToModel(userInfo);
    const logLevel: LogLevel = userInfo.logs || (IS_DEBUG ? "trace" : "error");
    localStorage.setItem(LOG_LEVEL_LS, logLevel);
    loggerFactory.setLogWarnings(logLevel);
    this.store.setUserSettings(um);
  }

  private setUserImage(image: string) {
    this.store.setUserImage(image);
  }

  /*
   * Private hideGrowlProgress(key: number) {
   *   let progInter = this.progressInterval[key];
   *   if (progInter) {
   *     this.logger.debug('Removing progressInterval {}', key)();
   *     progInter.growl.hide();
   *     if (progInter.interval) {
   *       clearInterval(progInter.interval);
   *     }
   *     delete this.progressInterval[key];
   *   }
   * }
   */


  /*
   * SendPreventDuplicates(data, skipGrowl) {
   *   this.messageId++;
   *   data.messageId = this.messageId;
   *   let jsonRequest = JSON.stringify(data);
   *   if (!this.duplicates[jsonRequest]) {
   *     this.duplicates[jsonRequest] = Date.now();
   *     this.sendRawTextToServer(jsonRequest, skipGrowl, data);
   *     setTimeout(() => {
   *       delete this.duplicates[jsonRequest];
   *     }, 5000);
   *   } else {
   *     this.logger.warn('blocked duplicate from sending: {}', jsonRequest)();
   *   }
   * }
   */




  private sendToServer<T extends DefaultWsOutMessage<string, any>>(messageRequest: T, skipGrowl = false): boolean {
    const isSent = this.wsMessageProcessor.sendToServer<T>(messageRequest);
    if (!isSent && !skipGrowl) {
      this.logger.warn("Can't send message, because connection is lost :(")();
    }
    return isSent;
  }


}
