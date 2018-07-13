import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import {IMessageHandler} from '../types/types';
import {WebRtcDefaultMessage} from '../types/messages';
import WsHandler from '../utils/WsHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';
import Subscription from '../utils/Subscription';
import FileSender from './FileSender';
import NotifierHandler from '../utils/NotificationHandler';

export default class WebRtcApi implements IMessageHandler {
  logger: Logger;
  private quedId = 0;

  private connections = {};
  private quedConnections = {};
  private wsHandler: WsHandler;
  private store: Store<RootState>;
  private sub: Subscription;
  private notifier: NotifierHandler;

  constructor(ws: WsHandler, store: Store<RootState>, notifier: NotifierHandler, sub: Subscription) {
    this.wsHandler = ws;
    this.sub = sub;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC', 'color: #960055');
    this.store = store;
  }

  createQuedId() {
    return this.quedId++;
  }

  proxyHandler  (data) {
    this.connections[data.connId]['on' + data.type](data);
  }

  onsetConnectionId(message) {
    let el = this.quedConnections[message.id];
    delete this.quedConnections[message.id];
    this.connections[message.connId] = el;
    el.setConnectionId(message.connId);
  }

  onofferFile(message) {
    // let handler = new FileReceiver(this.removeChildReference);
    // this.connections[message.connId] = handler;
    // handler.initAndDisplayOffer(message);
  }

  onofferCall(message) {
    // if (handler) {
    //   this.connections[message.connId] = handler;
    //   handler.initAndDisplayOffer(message, chatHandler.roomName);
    // } else {
    //   this.wsHandler.sendToServer({
    //     action: 'cancelCallConnection',
    //     connId: message.connId
    //   });
    //   this.store.dispatch('growlInfo', `User ${message.user} tried to call`);
    // }
  }

  handle(data: WebRtcDefaultMessage) {
    if (data.handler === 'webrtc') {
      self['on' + data.action](data);
    } else if (this.connections[data.connId]) {
      this.connections[data.connId].handle(data);
    } else {
      this.logger.error('Unable to handle "{}" because connection "{}" is unknown.' +
          ' Available connections: "{}". Skipping message:',
          data.action, data.connId, Object.keys(this.connections))();
    }
  }

  addCallHandler (callHandler) {
    let newId = this.createQuedId();
    this.quedConnections[newId] = callHandler;
    return newId;
  }
  offerFile(file, channel) {
    let newId = this.createQuedId();
    this.quedConnections[newId] = new FileSender(this.removeChildReference, this.wsHandler, this.notifier, this.store, file);
    this.quedConnections[newId].sendOffer(newId, channel);
    return this.quedConnections[newId];
  }
  removeChildReference(id) {
    this.logger.log('Removing transferHandler with id {}', id)();
    delete this.connections[id];
  }
}