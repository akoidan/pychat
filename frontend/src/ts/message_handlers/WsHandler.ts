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
  MessageStatus,
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
import type {
  GiphyDto,
  RoomNoUsersDto,
  UserProfileDto,
  UserProfileDtoWoImage,
  UserSettingsDto,
} from "@/ts/types/dto";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {WsMessageProcessor} from "@/ts/message_handlers/WsMessageProcessor";
import type {
  AddChannelMessage,
  AddInviteMessage,
  AddRoomMessage,
  GetCountryCodeMessage,
  MessagesResponseMessage,
  PingMessage,
  PongMessage,
  PrintMessage,
  SaveChannelSettingsMessage,
  SetProfileImageMessage,
  SetSettingsMessage,
  SetUserProfileMessage,
  SetWsIdMessage,
  SyncHistoryResponseMessage,
  UserProfileChangedMessage,
  WebRtcSetConnectionIdMessage,
} from "@/ts/types/messages/wsInMessages";
import type {
  InternetAppearMessage,
  LogoutMessage,
  PubSetRooms,
} from "@/ts/types/messages/innerMessages";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  DefaultWsOutMessage,
  SyncHistoryOutMessage,
} from "@/ts/types/messages/wsOutMessages";
import type Subscription from "@/ts/classes/Subscription";

enum WsState {
  NOT_INITED, TRIED_TO_CONNECT, CONNECTION_IS_LOST, CONNECTED,
}

export default class WsHandler extends MessageHandler implements MessageSupplier {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WsHandler, "ws"> = {
    setSettings: <HandlerType<"setSettings", "ws">> this.setSettings,
    setUserProfile: <HandlerType<"setUserProfile", "ws">> this.setUserProfile,
    setProfileImage: <HandlerType<"setProfileImage", "ws">> this.setProfileImage,
    setWsId: <HandlerType<"setWsId", "ws">> this.setWsId,
    logout: <HandlerType<"logout", "ws">> this.logout,
    userProfileChanged: <HandlerType<"userProfileChanged", "ws">> this.userProfileChanged,
    ping: <HandlerType<"ping", "ws">> this.ping,
    pong: <HandlerType<"pong", "ws">> this.pong,
  };


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

  public async getCountryCode(): Promise<GetCountryCodeMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: "getCountryCode",
    });
  }

  public async offerFile(roomId: number, browser: string, name: string, size: number, threadId: number | null): Promise<WebRtcSetConnectionIdMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: "offerFile",
      roomId,
      threadId,
      content: {
        browser,
        name,
        size,
      },
    });
  }

  public async offerCall(roomId: number, browser: string): Promise<WebRtcSetConnectionIdMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: "offerCall",
      roomId,
      content: {browser},
    });
  }

  public acceptFile(connId: string, received: number) {
    this.sendToServer({
      action: "acceptFile",
      connId,
      content: {
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
  ): Promise<PrintMessage> {
    const newVar = {
      files,
      id,
      timeDiff,
      action: "printMessage",
      content,
      tags,
      parentMessage,
      roomId,
      giphies,
    };
    return this.messageProc.sendToServerAndAwait(newVar);
  }

  public async saveSettings(content: UserSettingsDto): Promise<SetSettingsMessage | unknown> {
    return this.messageProc.sendToServerAndAwait({
      action: "setSettings",
      content,
    });
  }

  public showIType(roomId: number): void {
    this.sendToServer({
      roomId,
      action: "showIType",
    });
  }

  public async saveUser(content: UserProfileDtoWoImage): Promise<SetUserProfileMessage | unknown> {
    return this.messageProc.sendToServerAndAwait({
      action: "setUserProfile",
      content,
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
  ): Promise<SyncHistoryResponseMessage> {
    const payload: SyncHistoryOutMessage = {
      messagesIds,
      receivedMessageIds,
      onServerMessageIds,
      roomIds,
      lastSynced,
      action: "syncHistory",
    };
    return this.messageProc.sendToServerAndAwait(payload);
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

  public logout(a: LogoutMessage) {
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
    return this.messageProc.sendToServerAndAwait({
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

  public destroyCallConnection(connId: string, content: "decline" | "hangup") {
    this.sendToServer({
      content,
      action: "destroyCallConnection",
      connId,
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

  public setSettings(m: SetSettingsMessage) {
    const a: CurrentUserSettingsModel = userSettingsDtoToModel(m.content);
    this.setUserSettings(a);
  }

  public setUserProfile(m: SetUserProfileMessage) {
    const a: CurrentUserInfoWoImage = currentUserInfoDtoToModel(m.content);
    a.userId = this.store.userInfo!.userId; // This could came only when we logged in
    this.store.setUserInfo(a);
  }

  public setProfileImage(m: SetProfileImageMessage) {
    this.setUserImage(m.content);
  }

  public convertServerTimeToPC(serverTime: number) {
    return serverTime + this.timeDiffWithServer; // ServerTime + (Date.now - serverTime) === Date.now
  }

  public async setWsId(message: SetWsIdMessage) {
    this.wsConnectionId = message.opponentWsId;
    this.setUserInfo(message.userInfo);
    this.setUserSettings(message.userSettings);
    this.setUserImage(message.userInfo.userImage);
    this.timeDiffWithServer = Date.now() - message.time;
    const pubSetRooms: PubSetRooms = {
      action: "init",
      channels: message.channels,
      handler: "room",
      rooms: message.rooms,
      online: message.online,
      users: message.users,
    };
    this.sub.notify(pubSetRooms);
    const inetAppear: InternetAppearMessage = {
      action: "internetAppear",
      handler: "*",
    };

    this.sub.notify(inetAppear);
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

  public userProfileChanged(message: UserProfileChangedMessage) {
    this.store.setUser({
      id: message.userId,
      user: message.user,
      image: message.userImage,
      sex: message.sex,
    });
  }

  public ping(message: PingMessage) {
    this.startNoPingTimeout();
    this.sendToServer({
      action: "pong",
      time: message.time,
    });
  }

  public pong(message: PongMessage) {
    // Private answerPong() {
    if (this.pingTimeoutFunction) {
      this.logger.debug("Clearing pingTimeoutFunction")();
      clearTimeout(this.pingTimeoutFunction);
      this.pingTimeoutFunction = null;
    }
    // }
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
    if (e.code === 403) {
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

  private sendToServer<T extends DefaultWsOutMessage<string>>(messageRequest: T, skipGrowl = false): boolean {
    const isSent = this.messageProc.sendToServer(messageRequest);
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
