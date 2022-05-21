import type {GiphyDto} from "@common/model/dto/giphy.dto";
import type {RoomNoUsersDto} from "@common/model/dto/room.dto";
import type {
  UserProfileDto,
  UserProfileDtoWoImage,
} from "@common/model/dto/user.profile.dto";
import type {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import type {MessageStatus} from "@common/model/enum/message.status";
import type {MessagesResponseMessage} from "@common/model/ws.base";
import type {AddChannelMessage} from "@common/ws/message/room/add.channel";
import type {AddInviteMessage} from "@common/ws/message/room/add.invite";
import type {AddRoomMessage} from "@common/ws/message/room/add.room";
import type {SaveChannelSettingsMessage} from "@common/ws/message/room/save.channel.settings";
import type {ShowITypeWsOutMessage} from "@common/ws/message/room/show.i.type";
import type {
  WebRtcSetConnectionIdBody,
  WebRtcSetConnectionIdMessage,
} from "@common/ws/message/sync/set.connection.id";
import type {PingMessage} from "@common/ws/message/ws/ping";
import {SetProfileImageBody} from "@common/ws/message/ws/set.profile.image";
import type {
  SetProfileImageMessage,
} from "@common/ws/message/ws/set.profile.image";
import {
  SetSettingBody,
} from "@common/ws/message/ws/set.settings";
import type {
  SetSettingsMessage,

  SetSettingsWsOutMessage,
} from "@common/ws/message/ws/set.settings";
import type {SetUserProfileMessage, SetUserProfileWsOutMessage} from "@common/ws/message/ws/set.user.profile";
import type {SetWsIdWsOutMessage,
  SetWsIdWsInMessage} from "@common/ws/message/ws/set.ws.id";
import {UserProfileChangedBody} from "@common/ws/message/ws/user.profile.changed";
import type {
  UserProfileChangedMessage,
} from "@common/ws/message/ws/user.profile.changed";
import type {
  PrintMessageWsInMessage,
  PrintMessageWsOutMessage,
} from "@common/ws/message/ws-message/print.message";
import type {GetCountryCodeWsInMessage,
  GetCountryCodeWsOutMessage,
  GetCountryCodeWsInBody} from "@common/ws/message/get.country.code";
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

import type {ShowITypeWsOutMessage} from "@common/ws/message/show.i.type";
import type {
  PrintMessageWsInMessage,
  PrintMessageWsOutMessage,
} from "@common/ws/message/print.message";
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
import MessageHandler from "@/ts/message_handlers/MesageHandler";
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
import {SetUserProfileBody} from "@common/ws/message/ws/set.user.profile";
import {
  SetWsIdBody,
} from "@common/ws/message/ws/set.ws.id";
import {Gender} from "@common/model/enum/gender";
import {PingBody} from "@common/ws/message/ws/ping";
import type {
  PongWsInMessage,
  PongWsOutMessage,
} from "@common/ws/message/ws/pong";
import type {
  OfferFileBody,
  OfferFileWsOutMessage,

  OfferFileMessage,

  OfferFileRequest,
  OfferFileResponse,
} from "@common/ws/message/webrtc/offer.file";
import {RequestWsOutMessage} from "@common/ws/common";
import type {
  OfferCallRequest,
  OfferCallResponse,
} from "@common/ws/message/webrtc/offer.call";
import type {AcceptFileWsOutMessage} from "@common/ws/message/webrtc-transfer/accept.file";
import type {DestroyCallConnectionWsOutMessage} from "@common/ws/message/peer-connection/destroy.call.connection";


enum WsState {
  NOT_INITED, TRIED_TO_CONNECT, CONNECTION_IS_LOST, CONNECTED,
}

export default class WsHandler extends MessageHandler implements MessageSupplier {
  protected readonly logger: Logger;

  /*
   * How much current time is ahead of the server time
   * if current time is in the past it will be negative
   */
  private timeDiffWithServer: number = 0;

  private pingTimeoutFunction: number | null = null;

  private ws: WebSocket | null = null;

  private noServerPingTimeout: any;

  private readonly store: DefaultStore;

  private readonly sessionHolder: SessionHolder;

  private listenWsTimeout: number | null = null;

  private readonly API_URL: string;

  private readonly messageProc: WsMessageProcessor;

  private wsState: WsState = WsState.NOT_INITED;

  /*
   * This.dom = {
   *   onlineStatus: $('onlineStatus'),
   *   onlineClass: 'online',
   *   offlineClass: OFFLINE_CLASS
   * };
   * private progressInterval = {}; TODO this was commented along with usage, check if it breaks anything
   */
  private wsConnectionId = "";

  private readonly sub: Subscription;

  public constructor(API_URL: string, sessionHolder: SessionHolder, store: DefaultStore, sub: Subscription) {
    super();
    this.sub = sub;
    this.sub.subscribe("ws", this);
    this.API_URL = API_URL;
    this.messageProc = new WsMessageProcessor(this, store, "ws", sub);
    this.logger = loggerFactory.getLoggerColor("ws", "#4c002b");
    this.sessionHolder = sessionHolder;
    this.store = store;
  }

  private get wsUrl() {
    return `${this.API_URL}?id=${this.wsConnectionId}&sessionId=${this.sessionHolder.session}`;
  }

  sendRawTextToServer(message: string): boolean {
    if (this.isWsOpen()) {
      this.ws!.send(message);
      return true;
    }
    return false;
  }

  public getWsConnectionId() {
    return this.wsConnectionId;
  }

  public async getCountryCode(): Promise<GetCountryCodeWsInBody> {
    return this.messageProc.sendToServerAndAwait<GetCountryCodeWsOutMessage, GetCountryCodeWsInMessage>({
      action: "getCountryCode",
      data: null,
    });
  }

  public async offerFile(roomId: number, browser: string, name: string, size: number, threadId: number | null): Promise<WebRtcSetConnectionIdBody> {
    return this.messageProc.sendToServerAndAwait<OfferFileRequest, OfferFileResponse>({
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
    return this.messageProc.sendToServerAndAwait<OfferCallRequest, OfferCallResponse>({
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
    return this.messageProc.sendToServerAndAwait({
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
    content: string,
    roomId: number,
    files: number[],
    id: number,
    timeDiff: number,
    parentMessage: number | null,
    tags: Record<string, number>,
    giphies: GiphyDto[],
  ): Promise<PrintMessageWsInMessage> {
    return this.messageProc.sendToServerAndAwait<PrintMessageWsOutMessage, "printMessage">({
      files,
      id,
      timeDiff,
      action: "printMessage",
      content,
      tags,
      parentMessage,
      roomId,
      giphies,
    });
  }

  public async saveSettings(content: UserSettingsDto): Promise<SetSettingsMessage | unknown> {
    return this.messageProc.sendToServerAndAwait<SetSettingsWsOutMessage, SetSettingsMessage>({
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
    return this.messageProc.sendToServerAndAwait<SetUserProfileWsOutMessage, SetUserProfileMessage>({
      action: "setUserProfile",
      data,
    });
  }

  public async sendAddRoom(name: string | null, p2p: boolean, volume: number, notifications: boolean, users: number[], channelId: number | null): Promise<AddRoomMessage> {
    return this.messageProc.sendToServerAndAwait({
      users,
      name,
      p2p,
      channelId,
      action: "addRoom",
      volume,
      notifications,
    });
  }

  public async syncHistory(
    roomIds: number[],
    messagesIds: number[],
    receivedMessageIds: number[],
    onServerMessageIds: number[],
    lastSynced: number,
  ): Promise<SyncHistoryWsInMessage> {
    return this.messageProc.sendToServerAndAwait<SyncHistoryWsOutMessage, "syncHistory">({
      messagesIds,
      receivedMessageIds,
      onServerMessageIds,
      roomIds,
      lastSynced,
      action: "syncHistory",
    });
  }

  public async sendAddChannel(channelName: string, users: number[]): Promise<AddChannelMessage> {
    return this.messageProc.sendToServerAndAwait({
      channelName,
      users,
      action: "addChannel",
    });
  }

  public async sendRoomSettings(message: RoomNoUsersDto): Promise<void> {
    return this.messageProc.sendToServerAndAwait({
      ...message,
      action: "saveRoomSettings",
    });
  }

  public async sendDeleteChannel(channelId: number): Promise<unknown> {
    return this.messageProc.sendToServerAndAwait({
      channelId,
      action: "deleteChannel",
    });
  }

  public async sendLeaveChannel(channelId: number): Promise<unknown> {
    return this.messageProc.sendToServerAndAwait({
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
  ): Promise<SaveChannelSettingsMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: "saveChannelSettings",
      channelId,
      channelCreatorId,
      channelName,
      volume,
      notifications,
    });
  }

  public async inviteUser(roomId: number, users: number[]): Promise<AddInviteMessage> {
    return this.messageProc.sendToServerAndAwait({
      roomId,
      users,
      action: "inviteUser",
    });
  }

  public async startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log("Starting webSocket")();
      if (!this.listenWsTimeout && !this.ws) {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onmessage = this.onWsMessage.bind(this);
        this.ws.onclose = (e) => {
          setTimeout(() => {
            reject(Error("Cannot connect to websocket"));
          });
          this.onWsClose(e);
        };
        this.ws.onopen = () => {
          setTimeout(resolve);
          this.onWsOpen();
        };
      } else {
        resolve();
      }
    });
  }

  public pingServer() {
    this.sendToServer({action: "ping"}, true);

    /*
     * TODO not used
     * this.answerPong();
     * this.pingTimeoutFunction = setTimeout(() => {
     *   this.logger.error('Force closing socket coz pong time out')();
     *   this.ws.close(1000, 'Ping timeout');
     * }, PING_CLOSE_JS_DELAY);
     *
     */
  }

  @Subscribe<LogoutMessage>()
  public logout() {
    const info = [];
    if (this.listenWsTimeout) {
      this.listenWsTimeout = null;
      info.push("purged timeout");
    }
    if (this.ws) {
      this.ws.onclose = null;
      info.push("closed ws");
      this.ws.close();
      this.ws = null;
    }
    this.logger.debug("Finished ws: {}", info.join(", "))();
  }

  public async sendDeleteRoom(roomId: number) {
    return this.messageProc.sendToServerAndAwait({
      roomId,
      action: "deleteRoom",
    });
  }

  public async sendLeaveRoom(roomId: number) {
    return this.messageProc.sendToServerAndAwait({
      roomId,
      action: "leaveUser",
    });
  }

  public async setMessageStatus(
    messagesIds: number[],
    roomId: number,
    status: MessageStatus,
  ) {
    return this.messageProc.sendToServerAndAwait<SetMessageStatusWsOutMessage, "setMessageStatus">({
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
    return this.messageProc.sendToServerAndAwait({
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
    return this.messageProc.sendToServerAndAwait({
      messagesIds,
      action: "loadMessagesByIds",
      roomId,
    });
  }

  public isWsOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
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
    return this.messageProc.sendToServerAndAwait({
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

  @Subscribe<SetProfileImageMessage>()
  public setProfileImage(m: SetProfileImageBody) {
    this.setUserImage(m.url);
  }

  public convertServerTimeToPC(serverTime: number) {
    return serverTime + this.timeDiffWithServer; // ServerTime + (Date.now - serverTime) === Date.now
  }


  @Subscribe<SetWsIdWsInMessage>()
  public async setWsId(message: SetWsIdBody) {
    this.wsConnectionId = message.opponentWsId;
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

  @Subscribe<UserProfileChangedMessage>()
  public userProfileChanged(message: UserProfileChangedBody) {
    this.store.setUser(message);
  }


  @Subscribe<PingMessage>()
  public ping(message: PingBody) {
    this.startNoPingTimeout();
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

  private onWsOpen() {
    this.setStatus(true);
    this.startNoPingTimeout();
    this.wsState = WsState.CONNECTED;
    this.logger.debug("Connection has been established")();
  }

  private onWsMessage(message: MessageEvent) {
    const data = this.messageProc.parseMessage(message.data);
    if (data) {
      this.messageProc.handleMessage(data);
    }
  }

  private setStatus(isOnline: boolean) {
    this.store.setIsOnline(isOnline);
    this.logger.debug("Setting online to {}", isOnline)();
  }

  private onWsClose(e: CloseEvent) {
    this.logger.log("Got onclose event")();
    this.ws = null;
    this.setStatus(false);
    // Tornado drops connection if exception occurs during processing an event we send from WsHandler
    this.messageProc.onDropConnection(e.code === 1006 ? "Server error" : "Connection to server is lost");

    /*
     * For (let k in this.progressInterval) {
     *   this.hideGrowlProgress(k);
     * }
     */
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.noServerPingTimeout = null;
    }
    const reason = e.reason || e;
    if (e.code === WS_SESSION_EXPIRED_CODE) {
      const message = `Server has forbidden request because '${reason}'. Logging out...`;
      this.logger.error("onWsClose {}", message)();
      this.store.growlError(message);
      const message1: LogoutMessage = {
        action: "logout",
        handler: "*",
      };
      this.sub.notify(message1);
      return;
    } else if (this.wsState === WsState.NOT_INITED) {
      // This.store.growlError( 'Can\'t establish connection with server');
      this.logger.warn("Chat server is down because {}", reason)();
      this.wsState = WsState.TRIED_TO_CONNECT;
    } else if (this.wsState === WsState.CONNECTED) {
      // This.store.growlError( `Connection to chat server has been lost, because ${reason}`);
      this.logger.error(
        "Connection to WebSocket has failed because \"{}\". Trying to reconnect every {}ms",
        e.reason,
        CONNECTION_RETRY_TIME,
      )();
    }
    if (this.wsState !== WsState.TRIED_TO_CONNECT) {
      this.wsState = WsState.CONNECTION_IS_LOST;
    }
    // Try to reconnect in 10 seconds
    this.listenWsTimeout = window.setTimeout(() => {
      this.listenWS();
    }, CONNECTION_RETRY_TIME);
  }

  private listenWS() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onclose = this.onWsClose.bind(this);
    this.ws.onopen = this.onWsOpen.bind(this);
  }

  private sendToServer<T extends DefaultWsOutMessage<string, any>>(messageRequest: T, skipGrowl = false): boolean {
    const isSent = this.messageProc.sendToServer<T>(messageRequest);
    if (!isSent && !skipGrowl) {
      this.logger.warn("Can't send message, because connection is lost :(")();
    }
    return isSent;
  }

  private startNoPingTimeout() {
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.logger.debug("Clearing noServerPingTimeout")();
      this.noServerPingTimeout = null;
    }
    this.noServerPingTimeout = setTimeout(() => {
      if (this.ws) {
        this.logger.error("Force closing socket coz server didn't ping us")();
        this.ws.close(1000, "Sever didn't ping us");
      }
    }, CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT);
  }
}
