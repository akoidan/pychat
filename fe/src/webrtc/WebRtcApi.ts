import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import {IMessageHandler, SetSendingFile} from '../types/types';
import {DefaultMessage, WebRtcDefaultMessage, WebRtcSetConnectionIdMessage} from '../types/messages';
import WsHandler from '../utils/WsHandler';
import {RootState} from '../types/model';
import {Store} from 'vuex';
import Subscription from '../utils/Subscription';
import FileSender from './FileSender';
import NotifierHandler from '../utils/NotificationHandler';
import {browserVersion} from '../utils/singletons';
import MessageHandler from '../utils/MesageHandler';

export default class WebRtcApi extends MessageHandler {

  protected logger: Logger;

  private connections = {};
  private wsHandler: WsHandler;
  private store: Store<RootState>;
  private sub: Subscription;
  private notifier: NotifierHandler;

  constructor(ws: WsHandler, store: Store<RootState>, notifier: NotifierHandler, sub: Subscription) {
    super();
    this.wsHandler = ws;
    this.sub = sub;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC', 'color: #960055');
    this.store = store;
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> }  = {

  };

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

  addCallHandler (callHandler) {
    // let newId = this.createQuedId();
    // this.quedConnections[newId] = callHandler;
    // return newId;
  }

  offerFile(file, channel) {
    let fileSender = new FileSender(this.removeChildReference, this.wsHandler, this.notifier, this.store, file);
    this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, (e: WebRtcSetConnectionIdMessage) => {
      if (e.connId) {
        this.connections[e.connId] = fileSender;
        let payload: SetSendingFile = {
          roomId: channel,
          sendingFile: {
            connId: e.connId,
            fileName: file.name,
            fileSize: file.size,
            time: e.time,
            transfers: {},
          },
        };
        this.store.commit('addSendingFile', payload);
      }
    });
  }

  removeChildReference(id) {
    this.logger.log('Removing transferHandler with id {}', id)();
    delete this.connections[id];
  }

}