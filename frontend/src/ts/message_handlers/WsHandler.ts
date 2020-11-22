import {
  CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT,
  CONNECTION_RETRY_TIME,
  IS_DEBUG
} from '@/ts/utils/consts';
import {
  Logger,
} from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  UserModel
} from '@/ts/types/model';
import {
  MessageSupplier,
  SessionHolder
} from '@/ts/types/types';
import {
  convertUser,
  currentUserInfoDtoToModel,
  userSettingsDtoToModel
} from '@/ts/types/converters';
import {
  RoomNoUsersDto,
  UserProfileDto,
  UserSettingsDto
} from '@/ts/types/dto';
import { sub } from '@/ts/instances/subInstance';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import {WsMessageProcessor }from '@/ts/message_handlers/WsMessageProcessor';
import {
  AddChannelMessage,
  AddInviteMessage,
  AddRoomMessage,
  DefaultWsInMessage,
  DeleteMessage,
  EditMessage,
  PingMessage,
  PongMessage,
  PrintMessage,
  SaveChannelSettingsMessage,
  SetProfileImageMessage,
  SetSettingsMessage,
  SetUserProfileMessage,
  SetWsIdMessage,
  UserProfileChangedMessage,
  WebRtcSetConnectionIdMessage
} from '@/ts/types/messages/wsInMessages';
import {
  InternetAppearMessage,
  LogoutMessage,
  PubSetRooms
} from '@/ts/types/messages/innerMessages';
import {
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { DefaultWsOutMessage } from '@/ts/types/messages/wsOutMessages';

enum WsState {
  NOT_INITED, TRIED_TO_CONNECT, CONNECTION_IS_LOST, CONNECTED
}

export default class WsHandler extends MessageHandler implements MessageSupplier{
  public timeDiff: number = 0;

  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WsHandler, 'ws'> = {
    setSettings: <HandlerType<'setSettings', 'ws'>>this.setSettings,
    setUserProfile: <HandlerType<'setUserProfile', 'ws'>>this.setUserProfile,
    setProfileImage: <HandlerType<'setProfileImage', 'ws'>>this.setProfileImage,
    setWsId: <HandlerType<'setWsId', 'ws'>>this.setWsId,
    logout: <HandlerType<'logout', 'ws'>>this.logout,
    userProfileChanged: <HandlerType<'userProfileChanged', 'ws'>>this.userProfileChanged,
    ping: <HandlerType<'ping', 'ws'>>this.ping,
    pong: <HandlerType<'pong', 'ws'>> this.pong
  };

  private pingTimeoutFunction: number|null = null;
  private ws: WebSocket | null = null;
  private noServerPingTimeout: any;
  private readonly loadHistoryFromWs: boolean = false;
  private readonly store: DefaultStore;
  private readonly sessionHolder: SessionHolder;
  private listenWsTimeout: number|null = null;
  private readonly API_URL: string;
  private readonly messageProc: WsMessageProcessor;
  private wsState: WsState = WsState.NOT_INITED;

  // this.dom = {
  //   onlineStatus: $('onlineStatus'),
  //   onlineClass: 'online',
  //   offlineClass: OFFLINE_CLASS
  // };
  // private progressInterval = {}; TODO this was commented along with usage, check if it breaks anything
  private wsConnectionId = '';

  constructor(API_URL: string, sessionHolder: SessionHolder, store: DefaultStore) {
    super();
    sub.subscribe('ws', this);
    this.API_URL = API_URL;
    this.messageProc = new WsMessageProcessor(this, store, 'ws');
    this.logger = loggerFactory.getLoggerColor('ws', '#4c002b');
    this.sessionHolder = sessionHolder;
    this.store = store;
  }

  sendRawTextToServer(message: string): boolean {
    if (this.isWsOpen()) {
      this.ws!.send(message);
      return true;
    } else {
      return false;
    }
  }

  public getWsConnectionId () {
    return this.wsConnectionId;
  }

  public async offerFile(roomId: number, browser: string, name: string, size: number): Promise<WebRtcSetConnectionIdMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: 'offerFile',
      roomId: roomId,
      content: {browser, name, size}
    });
  }

  public async offerCall(roomId: number, browser: string): Promise<WebRtcSetConnectionIdMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: 'offerCall',
      roomId: roomId,
      content: {browser}
    });
  }

  public acceptFile(connId: string, received: number) {
    this.sendToServer({
      action: 'acceptFile',
      connId,
      content: {
        received
      }
    });
  }

  public replyFile(connId: string, browser: string) {
    this.sendToServer({
      action: 'replyFile',
      connId,
      content: {browser}
    });
  }

  public destroyFileConnection(connId: string, content: unknown) {
    this.sendToServer({
      content,
      action: 'destroyFileConnection',
      connId
    });
  }

  public destroyPeerFileConnection(connId: string, content: any, opponentWsId: string) {
    this.sendToServer({
      content,
      opponentWsId,
      action: 'destroyFileConnection',
      connId
    });
  }

  public sendEditMessage(content: string|null, id: number, files: number[] | null) {
    const newVar = {
      id,
      action: 'editMessage',
      files,
      content
    };
    this.sendToServer(newVar, true);
  }

  public async sendPrintMessage(content: string, roomId: number, files: number[], id: number, timeDiff: number): Promise<PrintMessage> {
    const newVar = {
      files,
      id,
      timeDiff,
      action: 'printMessage',
      content,
      roomId
    };
    return this.messageProc.sendToServerAndAwait(newVar);
  }

  public async saveSettings(content: UserSettingsDto): Promise<SetSettingsMessage|unknown> {
    return this.messageProc.sendToServerAndAwait({
      action: 'setSettings',
      content
    });
  }

  public async saveUser(content: UserProfileDto): Promise<SetUserProfileMessage|unknown> {
    return this.messageProc.sendToServerAndAwait({
      action: 'setUserProfile',
      content
    });
  }

  public async sendAddRoom(name: string|null, p2p: boolean, volume: number, notifications: boolean, users: number[], channelId: number|null): Promise<AddRoomMessage> {
    return this.messageProc.sendToServerAndAwait({
      users,
      name,
      p2p,
      channelId,
      action: 'addRoom',
      volume,
      notifications
    });
  }

  public async sendAddChannel(channelName: string): Promise<AddChannelMessage> {
    return this.messageProc.sendToServerAndAwait({
      channelName,
      action: 'addChannel'
    });
  }

  public async sendRoomSettings(message: RoomNoUsersDto): Promise<void> {
    return this.messageProc.sendToServerAndAwait({
      ...message,
      action: 'saveRoomSettings'
    });
  }

  public async sendDeleteChannel(channelId: number): Promise<unknown> {
    return this.messageProc.sendToServerAndAwait({
      channelId,
      action: 'deleteChannel'
    });
  }

  public async saveChannelSettings(channelName: string, channelId: number, channelCreatorId: number): Promise<SaveChannelSettingsMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: 'saveChannelSettings',
      channelId,
      channelCreatorId,
      channelName
    });
  }

  public async inviteUser(roomId: number, users: number[]): Promise<AddInviteMessage> {
    return this.messageProc.sendToServerAndAwait({
      roomId,
      users,
      action: 'inviteUser'
    });
  }

  public startListening() {
    this.logger.debug('Starting webSocket')();
    if (!this.listenWsTimeout && !this.ws) {
      this.listenWS();
    }
  }

  public pingServer() {
    this.sendToServer({action: 'ping'}, true);
    // TODO not used
    // this.answerPong();
    // this.pingTimeoutFunction = setTimeout(() => {
    //   this.logger.error('Force closing socket coz pong time out')();
    //   this.ws.close(1000, 'Ping timeout');
    // }, PING_CLOSE_JS_DELAY);
    //
  }

  public logout(a: LogoutMessage) {
    this.sessionHolder.session = '';
    const info = [];
    if (this.listenWsTimeout) {
      this.listenWsTimeout = null;
      info.push('purged timeout');
    }
    if (this.ws) {
      this.ws.onclose = null;
      info.push('closed ws');
      this.ws.close();
      this.ws = null;
    }
    this.logger.debug('Finished ws: {}', info.join(', '))();
  }

  public async sendLeaveRoom(roomId: number) {
    return this.messageProc.sendToServerAndAwait({
      roomId,
      action: 'deleteRoom'
    });
  }

  public async sendLoadMessages(roomId: number, headerId: number|undefined, count: number) {
    return this.messageProc.sendToServerAndAwait({
      headerId,
      count,
      action: 'loadMessages',
      roomId
    });
  }

  public isWsOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public sendRtcData(content: RTCSessionDescriptionInit| RTCIceCandidate, connId: string, opponentWsId: string) {
    this.sendToServer({
      content,
      connId,
      opponentWsId,
      action: 'sendRtcData'
    });
  }

  public retry(connId: string, opponentWsId: string) {
    this.sendToServer({action: 'retryFile',  connId, opponentWsId});
  }


  public replyCall(connId: string, browser: string) {
    this.sendToServer({
      action: 'replyCall',
      connId,
      content: {
        browser
      }
    });
  }

  public declineCall(connId: string) {
    this.sendToServer({
      content: 'decline',
      action: 'destroyCallConnection',
      connId
    });
  }

  public async offerMessageConnection(roomId: number): Promise<WebRtcSetConnectionIdMessage> {
    return this.messageProc.sendToServerAndAwait({
      action: 'offerMessage',
      roomId: roomId
    });
  }

  public acceptCall(connId: string) {
    this.sendToServer({
      action: 'acceptCall',
      connId
    });
  }


  public setSettings(m: SetSettingsMessage) {
    const a: CurrentUserSettingsModel = userSettingsDtoToModel(m.content);
    this.setUserSettings(a);
  }

  public setUserProfile(m: SetUserProfileMessage) {
    const a: CurrentUserInfoModel = currentUserInfoDtoToModel(m.content);
    a.userId = this.store.userInfo!.userId; // this could came only when we logged in
    this.store.setUserInfo(a);
  }

  public setProfileImage(m: SetProfileImageMessage) {
    this.setUserImage(m.content);
  }

  public setWsId(message: SetWsIdMessage) {
    this.wsConnectionId = message.opponentWsId;
    this.setUserInfo(message.userInfo);
    this.setUserSettings(message.userSettings);
    this.setUserImage(message.userImage);
    this.setTime(message.time);
    const pubSetRooms: PubSetRooms = {
      action: 'init',
      channels: message.channels,
      handler: 'channels',
      rooms: message.rooms,
      online: message.online,
      users: message.users
    };
    sub.notify(pubSetRooms);
    const inetAppear: InternetAppearMessage = {
      action: 'internetAppear',
      handler: 'any'
    };
    sub.notify(inetAppear);
    this.logger.debug('CONNECTION ID HAS BEEN SET TO {})', this.wsConnectionId)();
  }

  public userProfileChanged(message: UserProfileChangedMessage) {
    const user: UserModel = convertUser(message);
    this.store.setUser(user);
  }

  public ping(message: PingMessage) {
    this.startNoPingTimeout();
    this.sendToServer({action: 'pong', time: message.time});
  }

  public pong(message: PongMessage) {
  // private answerPong() {
    if (this.pingTimeoutFunction) {
      this.logger.debug('Clearing pingTimeoutFunction')();
      clearTimeout(this.pingTimeoutFunction);
      this.pingTimeoutFunction = null;
    }
    // }
  }

  private setUserInfo(userInfo: UserProfileDto) {
    const um: CurrentUserInfoModel = currentUserInfoDtoToModel(userInfo);
    this.store.setUserInfo(um);
  }

  private setUserSettings(userInfo: UserSettingsDto) {
    const um: UserSettingsDto = userSettingsDtoToModel(userInfo);
    if (!IS_DEBUG) {
      loggerFactory.setLogWarnings(userInfo.logs ?? 'debug');
    }
    this.store.setUserSettings(um);
  }

  private setUserImage(image: string) {
    this.store.setUserImage(image);
  }

  private onWsMessage(message: MessageEvent) {
    let data = this.messageProc.parseMessage(message.data);
    if (data) {
      this.messageProc.handleMessage(data);
    }
  }


  // private hideGrowlProgress(key: number) {
  //   let progInter = this.progressInterval[key];
  //   if (progInter) {
  //     this.logger.debug('Removing progressInterval {}', key)();
  //     progInter.growl.hide();
  //     if (progInter.interval) {
  //       clearInterval(progInter.interval);
  //     }
  //     delete this.progressInterval[key];
  //   }
  // }


  // sendPreventDuplicates(data, skipGrowl) {
  //   this.messageId++;
  //   data.messageId = this.messageId;
  //   let jsonRequest = JSON.stringify(data);
  //   if (!this.duplicates[jsonRequest]) {
  //     this.duplicates[jsonRequest] = Date.now();
  //     this.sendRawTextToServer(jsonRequest, skipGrowl, data);
  //     setTimeout(() => {
  //       delete this.duplicates[jsonRequest];
  //     }, 5000);
  //   } else {
  //     this.logger.warn('blocked duplicate from sending: {}', jsonRequest)();
  //   }
  // }

  private setStatus(isOnline: boolean) {
    if (this.store.isOnline !== isOnline) {
      this.store.setIsOnline(isOnline);
    }
  }

  private close() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }


  private onWsClose(e: CloseEvent) {
    this.ws = null;
    this.setStatus(false);
    // tornado drops connection if exception occurs during processing an event we send from WsHandler
    this.messageProc.onDropConnection(e.code === 1006 ? 'Server error' : 'Connection to server is lost')
    // for (let k in this.progressInterval) {
    //   this.hideGrowlProgress(k);
    // }
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.noServerPingTimeout = null;
    }
    const reason = e.reason || e;
    if (e.code === 403) {
      const message = `Server has forbidden request because '${reason}'. Logging out...`;
      this.logger.error('onWsClose {}', message)();
      this.store.growlError(message);
      let message1: LogoutMessage = {
        action: 'logout',
        handler: 'any'
      };
      sub.notify(message1);
      return;
    } else if (this.wsState === WsState.NOT_INITED) {
      // this.store.growlError( 'Can\'t establish connection with server');
      this.logger.error('Chat server is down because {}', reason)();
      this.wsState = WsState.TRIED_TO_CONNECT;
    } else if (this.wsState === WsState.CONNECTED) {
      // this.store.growlError( `Connection to chat server has been lost, because ${reason}`);
      this.logger.error(
          'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
          e.reason, CONNECTION_RETRY_TIME)();
    }
    if (this.wsState !== WsState.TRIED_TO_CONNECT) {
      this.wsState = WsState.CONNECTION_IS_LOST;
    }
    // Try to reconnect in 10 seconds
    this.listenWsTimeout = window.setTimeout(this.listenWS.bind(this), CONNECTION_RETRY_TIME);
  }

  private listenWS() {
    if (typeof WebSocket === 'undefined') {
      // TODO
      // alert('Your browser ({}) doesn\'t support webSockets. Supported browsers: ' +
      //     'Android, Chrome, Opera, Safari, IE11, Edge, Firefox'.format(window.browserVersion));
      return;
    }

    const ids: { [id: string]: number } = {};
    for (const k in this.store.roomsDict) {
      const maxId: number|null = this.store.maxId(parseInt(k));
      if (maxId) {
        ids[k] = maxId;
      }
    }
    let s = this.API_URL + `?id=${this.wsConnectionId}`;
    if (Object.keys(ids).length > 0) {
      s += `&messages=${encodeURI(JSON.stringify(ids))}`;
    }
    if (this.loadHistoryFromWs && this.wsState !== WsState.CONNECTION_IS_LOST) {
      s += '&history=true';
    }
    s += `&sessionId=${this.sessionHolder.session}`;

    this.ws = new WebSocket(s);
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onclose = this.onWsClose.bind(this);
    this.ws.onopen = () => {
      this.setStatus(true);
      this.startNoPingTimeout();
      this.wsState = WsState.CONNECTED;
      this.logger.debug('Connection has been established')();
    };
  }

  private sendToServer<T extends DefaultWsOutMessage<string>>(messageRequest: T, skipGrowl = false): boolean {
    const isSent = this.messageProc.sendToServer(messageRequest);
    if (!isSent && !skipGrowl) {
      this.store.growlError('Can\'t send message, because connection is lost :(');
    }
    return isSent;
  }


  private startNoPingTimeout() {
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.logger.debug('Clearing noServerPingTimeout')();
      this.noServerPingTimeout = null;
    }
    this.noServerPingTimeout = setTimeout(() => {
      if (this.ws) {
        this.logger.error('Force closing socket coz server didn\'t ping us')();
        this.ws.close(1000, 'Sever didn\'t ping us');
      }
    },                                    CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT);
  }

  private setTime(time: number) {
    this.timeDiff = Date.now() - time;
  }
}
