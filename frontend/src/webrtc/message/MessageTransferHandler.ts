import BaseTransferHandler from '@/webrtc/BaseTransferHandler';
import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
import {RoomModel} from '@/types/model';
import { UploadFile, UserIdConn} from '@/types/types';
import MessagePeerConnection from '@/webrtc/message/MessagePeerConnection';
import MessageSenderPeerConnection
  from '@/webrtc/message/MessageSenderPeerConnection';
import MessageReceiverPeerConnection
  from '@/webrtc/message/MessageReceiverPeerConnection';
import {
  DefaultMessage,
  EditMessage,
  OfferCall,
  PrintMessage
} from '@/types/messages';

export default class MessageTransferHandler extends BaseTransferHandler {

  protected readonly handlers: HandlerTypes = {
    removePeerConnection: <HandlerType>this.removePeerConnection
  };

  private sendingQueue: DefaultMessage[] = [];

  private peerConnections: Record<string, MessagePeerConnection> = {};

  get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  private state: 'not_inited' |'initing' | 'waiting' | 'ready' = 'not_inited';

  get connectionIds(): UserIdConn[] {
    let usersIds = this.room.users;
    let myConnectionId = this.wsHandler.getWsConnectionId();
    let connections = usersIds.reduce((connectionIdsWithUser, userId) => {
      let connectionIds: string[] = this.store.onlineDict[userId] ?? [];
      connectionIds.forEach(connectionId => {
        if (connectionId !== myConnectionId) {
          connectionIdsWithUser.push({userId, connectionId});
        }
      });
      return connectionIdsWithUser;
    } , [] as UserIdConn[]);

    return connections;
  }

  async acceptConnection(message: OfferCall) {
    let connectionIds = this.connectionIds;
    this.state = 'initing';
    this.initConnection(connectionIds, message.connId);
  }

   initConnection(connections: UserIdConn[], connId: string) {
    let myConnectionId = this.wsHandler.getWsConnectionId();
    connections.forEach(connectionIdWithUser => {
      let opponentWsId = connectionIdWithUser.connectionId;
      if (!this.peerConnections[opponentWsId]) {
        if (opponentWsId > myConnectionId) {
          this.peerConnections[opponentWsId]= new MessageSenderPeerConnection(this.roomId, connId, opponentWsId, this.wsHandler, this.store,  connectionIdWithUser.userId);

        } else {
          this.peerConnections[opponentWsId] = new MessageReceiverPeerConnection(this.roomId, connId, opponentWsId, this.wsHandler, this.store, connectionIdWithUser.userId);
        }
      }
      this.peerConnections[opponentWsId].makeConnection();

    });
   this.flushQueue();
  }

  flushQueue() {
    Object.values(this.peerConnections).forEach(pc => {
      pc.appendQueue(...this.sendingQueue);
    })
    this.sendingQueue = [];
  }

  public async sendP2pMessage(
      content: string,
      roomId: number,
      uploadfiles: UploadFile[],
      originId: number,
      time: number
  ) {
    // uploadfiles TODO
    const em: PrintMessage = {
      action: 'printMessage',
      content,
      edited: 0,
      roomId,
      time,
      messageId: originId, // should be -
      id: Date.now(),
      userId: this.store.myId!,
      handler: 'channels'
    }
    this.sendingQueue.push(em);
    let connectionIds = this.connectionIds;
    if (this.state === 'not_inited') {
      this.state = 'initing';
      if (this.connectionIds.length > 0) {
        let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
        this.initConnection(connectionIds, connId);
      } else {
        this.state = 'waiting';
      }
    }
  }

}
