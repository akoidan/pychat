import loggerFactory from '../utils/loggerFactory';
import {Logger} from 'lines-logger';
import {SetReceivingFileStatus} from '../types/types';
import {DefaultMessage, OfferFile, WebRtcSetConnectionIdMessage} from '../types/messages';
import WsHandler from '../utils/WsHandler';
import {ReceivingFile, ReceivingFileStatus, RootState, SendingFile} from '../types/model';
import {Store} from 'vuex';
import FileSender from './FileSender';
import NotifierHandler from '../utils/NotificationHandler';
import {browserVersion} from '../utils/singletons';
import MessageHandler from '../utils/MesageHandler';
import FileReceiver from './FileReceiver';
import {sub} from '../utils/sub';

export default class WebRtcApi extends MessageHandler {

  protected logger: Logger;

  private connections = {};
  private wsHandler: WsHandler;
  private store: Store<RootState>;
  private notifier: NotifierHandler;

  constructor(ws: WsHandler, store: Store<RootState>, notifier: NotifierHandler) {
    super();
    sub.subscribe('webrtc', this);
    this.wsHandler = ws;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC', 'color: #960055');
    this.store = store;
  }

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> }  = {
    offerFile(message: OfferFile) {
      this.connections[message.connId] = new FileReceiver(message.connId, this.removeChildReference, this.wsHandler, this.notifier, this.store);
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
      this.wsHandler.replyFile(message.connId, browserVersion);
    }
  };


  acceptFile(connId: string, roomId: number) {
    this.wsHandler.acceptFile(connId);
    let rf: SetReceivingFileStatus = {
      roomId, connId, status: ReceivingFileStatus.IN_PROGRESS
    };
    this.store.commit('setReceivingFileDecline', rf);
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
    this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, (e: WebRtcSetConnectionIdMessage) => {
      if (e.connId) {
        this.connections[e.connId] = new FileSender(e.connId, this.removeChildReference, this.wsHandler, this.notifier, this.store, file);;
        let payload: SendingFile = {
          roomId: channel,
          connId: e.connId,
          fileName: file.name,
          fileSize: file.size,
          time: e.time,
          transfers: {},
        };
        this.store.commit('addSendingFile', payload);
      }
    });
  }

  removeChildReference(id) {
    this.logger.log('Removing transferHandler with id {}, current connects are {}', id, this.connections)();
    sub.unsubscribe('webrtcTransfer:' + id);
    delete this.connections[id];
  }

}