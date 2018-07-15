import SenderPeerConnection from './SenderPeerConnection';
import {DefaultMessage, DestroyFileConnectionMessage} from '../types/messages';
import {SetSendingFileStatus} from '../types/types';
import {FileTransferStatus} from '../types/model';

export default class FileSenderPeerConnection extends SenderPeerConnection {

  protected readonly handlers: { [p: string]: SingleParamCB<DefaultMessage> } = {
    destroyFileConnection: this.destroyFileConnection
  };

  oniceconnectionstatechange(): void {
  }

  destroyFileConnection(message: DestroyFileConnectionMessage) {
    let isDecline = message.content === 'decline';
    let payload: SetSendingFileStatus = {
      transfer: this.opponentWsId,
      connId: this.connectionId,
      error: isDecline ? null : message.content,
      roomId: this.roomId,
      status: isDecline ? FileTransferStatus.DECLINED : FileTransferStatus.ERROR
    };
    this.store.commit('setSendingFileStatus', payload);
  }
}