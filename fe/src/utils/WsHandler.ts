import {Logger} from './Logger';
import {API_URL, CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT, CONNECTION_RETRY_TIME, PING_CLOSE_JS_DELAY} from './consts';
import {Store} from 'vuex';
import {VueRouter} from 'vue-router/types/router';
import {IStorage, RootState} from '../types';

enum WsState {
  NOT_INITED, TRIED_TO_CONNECT, CONNECTION_IS_LOST, CONNECTED
}

export class WsHandler {

  private logger: Logger;
  private pingTimeoutFunction;
  private ws: WebSocket;
  private noServerPingTimeout: any;
  private loadHistoryFromWs: boolean;
  private storage: IStorage;
  private store: Store<RootState>;
  private router: VueRouter;

  constructor(logger: Logger, channelsHandler, webRtcApi, storage: IStorage, store: Store<RootState>, router: VueRouter) {
    this.logger = logger;
    this.storage = storage;
    this.store = store;
    this.router = router;
    this.handlers = {
      channels: channelsHandler,
      chat: channelsHandler,
      ws: this,
      webrtc: webRtcApi,
      webrtcTransfer: webRtcApi,
      peerConnection: webRtcApi,
      growl: {
        handle: function (message) {
          alert(message.content);
          // growlError(message.content);
        }
      }
    };
  }

  private messageId: number = 0;
  private wsState: WsState = WsState.NOT_INITED;
  private duplicates = {};


  private logData(tag, obj, raw) {
    if (raw.length > 1000) {
      raw = '';
    }
    return this.logger.log('{} {}', raw, obj);
  }

  // this.dom = {
  //   onlineStatus: $('onlineStatus'),
  //   onlineClass: 'online',
  //   offlineClass: OFFLINE_CLASS
  // };
  private progressInterval = {};
  private wsConnectionId = '';

  private handlers: any;

  private handle(message) {
    this['on' + message.action](message);
  }

  onsetWsId(message) {
    this.wsConnectionId = message.content;
    this.logger.log('CONNECTION ID HAS BEEN SET TO {})', this.wsConnectionId)();
  }

  onWsMessage(message) {
    let jsonData = message.data;
    let data;
    try {
      data = JSON.parse(jsonData);
      this.logData('WS_IN', data, jsonData);
    } catch (e) {
      this.logger.error('Unable to parse incomming message {}', jsonData)();
      return;
    }
    this.hideGrowlProgress(data.messageId);
    this.handleMessage(data);
  }

  handleMessage(data) {
    this.handlers[data.handler].handle(data);
  }


  private sendToServer(messageRequest, skipGrowl = false) {
    this.messageId++;
    messageRequest.messageId = this.messageId;
    let jsonRequest = JSON.stringify(messageRequest);
    return this.sendRawTextToServer(jsonRequest, skipGrowl, messageRequest);
  }

  private hideGrowlProgress(key) {
    let progInter = this.progressInterval[key];
    if (progInter) {
      this.logger.log('Removing progressInterval {}', key)();
      progInter.growl.hide();
      if (progInter.interval) {
        clearInterval(progInter.interval);
      }
      delete this.progressInterval[key];
    }
  }

  isWsOpen() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  sendRawTextToServer(jsonRequest, skipGrowl, objData) {
    let logEntry = jsonRequest.substring(0, 500);
    if (!this.isWsOpen()) {
      if (!skipGrowl) {
        alert('Can\'t send message, because connection is lost :(');
      }
      this.logger.error('Web socket is closed. Can\'t send {}', logEntry)();
      return false;
    } else {
      this.logData('WS_OUT', objData, jsonRequest)();
      this.ws.send(jsonRequest);
      return true;
    }
  }

  sendPreventDuplicates(data, skipGrowl) {
    this.messageId++;
    data.messageId = this.messageId;
    let jsonRequest = JSON.stringify(data);
    if (!this.duplicates[jsonRequest]) {
      this.duplicates[jsonRequest] = Date.now();
      this.sendRawTextToServer(jsonRequest, skipGrowl, data);
      setTimeout(() => {
        delete this.duplicates[jsonRequest];
      }, 5000);
    } else {
      this.logger.warn('blocked duplicate from sending: {}', jsonRequest)();
    }
  }


  setStatus(isOnline) {
    this.store.commit('setIsOnline', isOnline);
  }


  onWsClose(e) {
    this.setStatus(false);
    for (let k in this.progressInterval) {
      this.hideGrowlProgress(k);
    }
    let reason = e.reason || e;
    if (e.code === 403) {
      let message = `Server has forbidden request because '${reason}'. Logging out...`;
      alert(message);
      this.logger.error('onWsClose {}', message)();
      this.router.replace('/auth');
      return;
    } else if (this.wsState === WsState.NOT_INITED) {
      alert('Can\'t establish connection with server');
      this.logger.error('Chat server is down because {}', reason)();
      this.wsState = WsState.TRIED_TO_CONNECT;
    } else if (this.wsState === WsState.CONNECTED) {
      alert(`Connection to chat server has been lost, because ${reason}`);
      this.logger.error(
          'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
          e.reason, CONNECTION_RETRY_TIME)();
    }
    if (this.wsState !== 1) {
      this.wsState = 2;
    }
    // Try to reconnect in 10 seconds
    setTimeout(this.listenWS, CONNECTION_RETRY_TIME);
  }


  public listenWS() {
    if (typeof WebSocket === 'undefined') {
      // TODO
      // alert('Your browser ({}) doesn\'t support webSockets. Supported browsers: ' +
      //     'Android, Chrome, Opera, Safari, IE11, Edge, Firefox'.format(window.browserVersion));
      return;
    }
    this.storage.getIds((ids) => {
      let s = API_URL + this.wsConnectionId;
      if (Object.keys(ids).length > 0) {
        s += '&messages=' + encodeURI(JSON.stringify(ids));
      }
      if (this.loadHistoryFromWs && this.wsState !== WsState.CONNECTION_IS_LOST) {
        s += '&history=true';
      }
      this.ws = new WebSocket(s);
      this.ws.onmessage = this.onWsMessage;
      this.ws.onclose = this.onWsClose;
      this.ws.onopen = () => {
        this.setStatus(true);
        let message = 'Connection to server has been established';
        if (this.wsState === 2) { // if not inited don't growl message on page load
          alert(message);
        }
        this.startNoPingTimeout();
        this.wsState = 9;
        this.logger.log(message)();
      };
    });
  }


  startNoPingTimeout() {
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.logger.log('Clearing noServerPingTimeout')();
      this.noServerPingTimeout = null;
    }
    this.noServerPingTimeout = setTimeout(() => {
      this.logger.error('Force closing socket coz server didn\'t ping us')();
      this.ws.close(1000, 'Sever didn\'t ping us');
    }, CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT);
  }

  onping(message) {
    this.startNoPingTimeout();
    this.sendToServer({action: 'pong', time: message.time});
  }

  pingServer() {
    if (this.sendToServer({action: 'ping'}, true)) {
      this.onpong();
      this.pingTimeoutFunction = setTimeout(() => {
        this.logger.error('Force closing socket coz pong time out')();
        this.ws.close(1000, 'Ping timeout');
      }, PING_CLOSE_JS_DELAY);
    }
  }

  onpong() {
    if (this.pingTimeoutFunction) {
      this.logger.debug('Clearing pingTimeoutFunction')();
      clearTimeout(this.pingTimeoutFunction);
      this.pingTimeoutFunction = null;
    }
  }
}