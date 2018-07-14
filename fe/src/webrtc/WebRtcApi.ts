import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import {SetReceivingFileStatus, SetSendingFile} from '../types/types';
import {DefaultMessage, OfferFile, WebRtcSetConnectionIdMessage} from '../types/messages';
import WsHandler from '../utils/WsHandler';
import {ReceivingFile, ReceivingFileStatus, RootState} from '../types/model';
import {Store} from 'vuex';
import Subscription from '../utils/Subscription';
import FileSender from './FileSender';
import NotifierHandler from '../utils/NotificationHandler';
import {browserVersion} from '../utils/singletons';
import MessageHandler from '../utils/MesageHandler';
import FileReceiver from './FileReceiver';

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
    offerFile(message: OfferFile) {
      this.connections[message.connId] = new FileReceiver(this.removeChildReference, this.wsHandler, this.notifier, this.store);
      let payload: ReceivingFile = {
        roomId: message.roomId,
        uploaded: 0,
        status: ReceivingFileStatus.NOT_DECIDED_YET,
        userId: message.userId,
        total: message.content.size,
        error: null,
        connId: message.connId,
        fileName: message.content.name,
        time: message.time
      };
      this.store.commit('addReceivingFile', payload);
    }
  };


  acceptFile(connId: string, roomId: number) {
    this.connections[connId]; // TODO
  }

  declineFile(connId: string, roomId: number) {
    this.wsHandler.declineFile(connId);
    this.removeChildReference(connId);
    let rf: SetReceivingFileStatus = {
      roomId, connId, status: ReceivingFileStatus.DECLINED
    };
    this.store.commit('setReceivingFileDecline', rf);
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
    this.logger.log('Removing transferHandler with id {}, current connects are {}', id, this.connections)();
    delete this.connections[id];
  }

}