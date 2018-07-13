import BaseTransferHandler from './BaseTransferHandler';
import {browserVersion} from '../utils/singletons';
import NotifierHandler from '../utils/NotificationHandler';
import {RootState} from '../types/model';
import WsHandler from '../utils/WsHandler';
import {Store} from 'vuex';

export default class FileSender extends BaseTransferHandler {
  private file: File;

  constructor(removeReferenceFn: Function, wsHandler: WsHandler, notifier: NotifierHandler, store: Store<RootState>, file: File) {
    super(removeReferenceFn, wsHandler, notifier, store);
    this.file = file;
  }
  sendOffer(quedId, channel, cb) {
    this.wsHandler.offerFile(channel, browserVersion, this.file.name, this.file.size, e => {
      this.logger.debug('cb {}', e)();
    });

  }
}
