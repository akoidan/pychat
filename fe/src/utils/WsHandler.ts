import {CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT, CONNECTION_RETRY_TIME, IS_DEBUG, PING_CLOSE_JS_DELAY} from './consts';
import {Store} from 'vuex';
import {Logger, LogStrict} from 'lines-logger';
import loggerFactory from './loggerFactory';
import MessageHandler from './MesageHandler';
import {logout} from './utils';
import {CurrentUserInfoModel, CurrentUserSettingsModel, RootState, UserModel} from '../types/model';
import {PubSetRooms, SessionHolder} from '../types/types';
import {
  DefaultMessage,
  GrowlMessage,
  PingMessage,
  SetProfileImageMessage,
  SetSettingsMessage,
  SetUserProfileMessage,
  SetWsIdMessage,
  UserProfileChangedMessage
} from '../types/messages';
import {convertUser, currentUserInfoDtoToModel, userSettingsDtoToModel} from '../types/converters';
import {UserProfileDto, UserSettingsDto} from '../types/dto';
import {sub} from './sub';

enum WsState {
  NOT_INITED, TRIED_TO_CONNECT, CONNECTION_IS_LOST, CONNECTED
}


export default class WsHandler extends MessageHandler {

  protected readonly logger: Logger;
  private loggerIn: Logger;
  private loggerOut: Logger;
  private pingTimeoutFunction;
  private ws: WebSocket;
  private noServerPingTimeout: any;
  private loadHistoryFromWs: boolean;
  private store: Store<RootState>;
  private sessionHolder: SessionHolder;
  private listenWsTimeout: number;
  private API_URL: string;
  private callBacks: { [id: number]: Function } = {};
  protected readonly handlers: { [id: string]: SingleParamCB<DefaultMessage> } = {
    growl: this.growl,
    setSettings: this.setSettings,
    setUserProfile: this.setUserProfile,
    setProfileImage: this.setProfileImage,
    setWsId: this.setWsId,
    userProfileChanged: this.userProfileChanged,
    ping: this.ping,
    pong: this.pong,
  };
  public timeDiff: number;

  constructor(API_URL: string, sessionHolder: SessionHolder, store: Store<RootState>) {
    super();
    sub.subscribe( 'ws', this);
    this.API_URL = API_URL;
    this.logger = loggerFactory.getLoggerColor('ws', '#2e631e');
    this.loggerIn = loggerFactory.getLoggerColor('ws:in', '#2e631e');
    this.loggerOut = loggerFactory.getLoggerColor('ws:out', '#2e631e');
    this.sessionHolder = sessionHolder;
    this.store = store;
  }



  public getWsConnectionId () {
    return this.wsConnectionId;
  }

  public offerFile(roomId, browser, name, size, cb) {
    this.sendToServer({
      action: 'offerFile',
      roomId: roomId,
      content: {browser, name, size}
    });
    this.appendCB(cb);
  }

  public offerCall(roomId, browser, cb) {
    this.sendToServer({
      action: 'offerCall',
      roomId: roomId,
      content: {browser}
    });
    this.appendCB(cb);
  }


    public pingCall(roomId, connectionId) {
        this.sendToServer({
            action: 'pingCall',
            roomId: roomId,
            connId:  connectionId
        });
    }

public acceptFile(connId, received) {
    this.sendToServer({
      action: 'acceptFile',
      connId,
      content: {
        received
      }
    });
  }

  public replyFile(connId, browser) {
    this.sendToServer({
      action: 'replyFile',
      connId,
      content: {browser}
    });
  }


  public destroyFileConnection(connId, content) {
    this.sendToServer({
      content,
      action: 'destroyFileConnection',
      connId
    });
  }

  public destroyPeerFileConnection(connId, content, opponentWsId) {
    this.sendToServer({
      content,
      opponentWsId,
      action: 'destroyFileConnection',
      connId
    });
  }


  public sendEditMessage(content: string, id: number, files: number[], messageId) {
    let newVar = {
      id,
      action: 'editMessage',
      files,
      messageId,
      content
    };
    this.sendToServer(newVar, true);
  }

  public sendSendMessage(content: string, roomId: number, files: number[], messageId: number, timeDiff) {
    let newVar = {
      files,
      messageId,
      timeDiff,
      action: 'sendMessage',
      content,
      roomId
    };
    this.sendToServer(newVar, true);
  }

  public saveSettings(content: UserSettingsDto, cb: SingleParamCB<SetSettingsMessage>) {
    this.sendToServer({
      action: 'setSettings',
      content,
    });
    this.appendCB(cb);
  }

  public saveUser(content: UserProfileDto, cb: SingleParamCB<SetUserProfileMessage>) {
    this.sendToServer({
      action: 'setUserProfile',
      content,
    });
    this.appendCB(cb);
  }

  public sendAddRoom(name, volume, notifications, users, cb: Function) {
    this.sendToServer({
      users,
      name,
      action: 'addRoom',
      volume,
      notifications
    });
    this.appendCB(cb);
  }


  public inviteUser(roomId: number, users: number[], cb: Function) {
    this.sendToServer({
      roomId,
      users,
      action: 'inviteUser',
    });
    this.appendCB(cb);
  }

  public startListening() {
    this.logger.debug('Starting webSocket')();
    if (!this.listenWsTimeout && !this.ws) {
      this.listenWS();
    }
  }

  public pingServer() {
    if (this.sendToServer({action: 'ping'}, true)) {
      this.answerPong();
      this.pingTimeoutFunction = setTimeout(() => {
        this.logger.error('Force closing socket coz pong time out')();
        this.ws.close(1000, 'Ping timeout');
      }, PING_CLOSE_JS_DELAY);
    }
  }

  public stopListening() {
    let info = [];
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


  public sendLeaveRoom(roomId, cb: Function) {
    this.sendToServer({
      roomId,
      action: 'deleteRoom',
    });
    this.appendCB(cb);
  }


  public sendLoadMessages(roomId: number, headerId: number, count: number, cb: Function) {
    this.sendToServer({
      headerId,
      count,
      action: 'loadMessages',
      roomId
    });
    this.appendCB(cb);
  }

  public isWsOpen() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  public sendRtcData(content, connId, opponentWsId) {
    this.sendToServer({
      content,
      connId,
      opponentWsId,
      action: 'sendRtcData'
    });
  }

  private sendToServer(messageRequest, skipGrowl = false) {
    if (!messageRequest.messageId) {
      messageRequest.messageId = this.getMessageId();
    }
    let jsonRequest = JSON.stringify(messageRequest);
    return this.sendRawTextToServer(jsonRequest, skipGrowl, messageRequest);
  }


  public retry(connId, opponentWsId) {
    this.sendToServer({action: 'retryFile',  connId, opponentWsId});
  }

  public getMessageId () {
    this.messageId++;
    return this.messageId;
  }


  private growl(gm: GrowlMessage) {
    this.store.dispatch('growlError', gm.content);
  }

  private setSettings(m: SetSettingsMessage) {
    let a: CurrentUserSettingsModel = userSettingsDtoToModel(m.content);
    this.setUserSettings(a);
  }

  private setUserProfile(m: SetUserProfileMessage) {
    let a: CurrentUserInfoModel = currentUserInfoDtoToModel(m.content);
    a.userId = this.store.state.userInfo.userId;
    this.store.commit('setUserInfo', a);
  }

  private setProfileImage(m: SetProfileImageMessage) {
    this.setUserImage(m.content);
  }

  private setWsId(message: SetWsIdMessage) {
    this.wsConnectionId = message.opponentWsId;
    this.setUserInfo(message.userInfo);
    this.setUserSettings(message.userSettings);
    this.setUserImage(message.userImage);
    this.setTime(message.time);
    let pubSetRooms: PubSetRooms = {
      action: 'init',
      handler: 'channels',
      rooms: message.rooms,
      online: message.online,
      users: message.users
    };
    sub.notify(pubSetRooms);
    let inetAppear: DefaultMessage = {
      action: 'internetAppear',
      handler: 'lan'
    };
    sub.notify(inetAppear);
    this.logger.debug('CONNECTION ID HAS BEEN SET TO {})', this.wsConnectionId)();
  }

  private userProfileChanged(message: UserProfileChangedMessage) {
    let user: UserModel = convertUser(message);
    this.store.commit('setUser', user);
  }

  private ping(message: PingMessage) {
    this.startNoPingTimeout();
    this.sendToServer({action: 'pong', time: message.time});
  }

  private pong() {
    this.answerPong();
  }

  private setUserInfo(userInfo: UserProfileDto) {
    let um: CurrentUserInfoModel = currentUserInfoDtoToModel(userInfo);
    this.store.commit('setUserInfo', um);
  }


  private setUserSettings(userInfo: UserSettingsDto) {
    let um: UserSettingsDto = userSettingsDtoToModel(userInfo);
    if (!IS_DEBUG) {
      loggerFactory.setLogWarnings(userInfo.logs ? LogStrict.TRACE : LogStrict.DISABLE_LOGS);
    }
    this.store.commit('setUserSettings', um);
  }

  private setUserImage(image: string) {
    this.store.commit('setUserImage', image);
  }

  private answerPong() {
    if (this.pingTimeoutFunction) {
      this.logger.debug('Clearing pingTimeoutFunction')();
      clearTimeout(this.pingTimeoutFunction);
      this.pingTimeoutFunction = null;
    }
  }



  private messageId: number = 0;
  private wsState: WsState = WsState.NOT_INITED;


  // this.dom = {
  //   onlineStatus: $('onlineStatus'),
  //   onlineClass: 'online',
  //   offlineClass: OFFLINE_CLASS
  // };
  private progressInterval = {};
  private wsConnectionId = '';



  private onWsMessage(message) {
    let jsonData = message.data;
    let data: DefaultMessage;
    try {
      data = JSON.parse(jsonData);
      this.logData(this.loggerIn, jsonData, data);
    } catch (e) {
      this.logger.error('Unable to parse incomming message {}', jsonData)();
      return;
    }
    if (!data.handler || !data.action) {
      this.logger.error('Invalid message structure')();
      return;
    }
    this.handleMessage(data);
  }

  private logData(logger: Logger, jsonData: string, message: DefaultMessage) {
    let raw = jsonData;
    if (raw.length > 1000) {
      raw = '';
    }
    if (message.action === 'ping' || message.action === 'pong') {
      logger.debug('{} {}', raw, message)();
    } else {
      logger.log('{} {}', raw, message)();
    }
  }

  private handleMessage(data: DefaultMessage) {
    if (data.handler !== 'void') {
      sub.notify(data);
    }
    if (this.callBacks[data.messageId] && (!data.cbBySender || data.cbBySender === this.wsConnectionId)) {
      this.logger.debug('resolving cb')();
      this.callBacks[data.messageId](data);
      delete this.callBacks[data.messageId];
    }
  }


  private hideGrowlProgress(key) {
    let progInter = this.progressInterval[key];
    if (progInter) {
      this.logger.debug('Removing progressInterval {}', key)();
      progInter.growl.hide();
      if (progInter.interval) {
        clearInterval(progInter.interval);
      }
      delete this.progressInterval[key];
    }
  }


  private sendRawTextToServer(jsonRequest, skipGrowl, objData) {
    if (!this.isWsOpen()) {
      if (!skipGrowl) {
        this.store.dispatch('growlError', 'Can\'t send message, because connection is lost :(');
      }
    } else {
      this.logData(this.loggerOut, jsonRequest, objData);
      this.ws.send(jsonRequest);
    }
  }

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


  private setStatus(isOnline) {
    if (this.store.state.isOnline !== isOnline) {
      this.store.commit('setIsOnline', isOnline);
    }
  }

  private close() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }


  private appendCB(cb: Function) {
    this.callBacks[this.messageId] = cb;
    this.logger.debug('Appending cb {}', cb)();
  }


  private onWsClose(e) {
    this.ws = null;
    this.setStatus(false);
    for (let cb in this.callBacks) {
      try {
        this.logger.debug('Resolving cb {}', cb)();
        let cbFn = this.callBacks[cb];
        delete this.callBacks[cb];
        cbFn({});
        this.logger.debug('Cb {} has been resolved', cb)();
      } catch (e) {
        this.logger.debug('Error {} during resolving cb {}', e, cb)();
      }
    }
    for (let k in this.progressInterval) {
      this.hideGrowlProgress(k);
    }
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.noServerPingTimeout = null;
    }
    let reason = e.reason || e;
    if (e.code === 403) {
      let message = `Server has forbidden request because '${reason}'. Logging out...`;
      this.logger.error('onWsClose {}', message)();
      logout(message);
      return;
    } else if (this.wsState === WsState.NOT_INITED) {
      // this.store.dispatch('growlError', 'Can\'t establish connection with server');
      this.logger.error('Chat server is down because {}', reason)();
      this.wsState = WsState.TRIED_TO_CONNECT;
    } else if (this.wsState === WsState.CONNECTED) {
      // this.store.dispatch('growlError', `Connection to chat server has been lost, because ${reason}`);
      this.logger.error(
          'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
          e.reason, CONNECTION_RETRY_TIME)();
    }
    if (this.wsState !== WsState.TRIED_TO_CONNECT) {
      this.wsState = WsState.CONNECTION_IS_LOST;
    }
    // Try to reconnect in 10 seconds
    this.listenWsTimeout = setTimeout(this.listenWS.bind(this), CONNECTION_RETRY_TIME);
  }



  private listenWS() {
    if (typeof WebSocket === 'undefined') {
      // TODO
      // alert('Your browser ({}) doesn\'t support webSockets. Supported browsers: ' +
      //     'Android, Chrome, Opera, Safari, IE11, Edge, Firefox'.format(window.browserVersion));
      return;
    }

    let ids = {};
    for (let k in this.store.state.roomsDict) {
      ids[k] = this.store.getters.maxId(k);
    }
    let s = this.API_URL + `/?id=${this.wsConnectionId}`;
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
    }, CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT);
  }


  replyCall(connId, browser) {
    this.sendToServer({
      action: 'replyCall',
      connId,
      content: {
        browser
      }
    });
  }

  declineCall(connId: string) {
    this.sendToServer({
      content: 'decline',
      action: 'destroyCallConnection',
      connId,
    });
  }

  acceptCall(connId: string) {
    this.sendToServer({
      action: 'acceptCall',
      connId
    });
  }

  private setTime(time: number) {
    this.timeDiff = Date.now() - time;
  }
}