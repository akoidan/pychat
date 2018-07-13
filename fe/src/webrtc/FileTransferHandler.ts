import BaseTransferHandler from './BaseTransferHandler';

export default class FileTransferHandler extends BaseTransferHandler {

  decline () {
    this.wsHandler.sendToServer({
      content: 'decline',
      action: 'destroyFileConnection',
      connId: this.connectionId
    });
  }

}