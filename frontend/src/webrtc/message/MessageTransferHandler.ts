import BaseTransferHandler from '@/webrtc/BaseTransferHandler';
import {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
import {RoomModel} from '@/types/model';
import {UploadFile} from '@/types/types';
import MessagePeerConnection from '@/webrtc/message/MessagePeerConnection';
import MessageSenderPeerConnection
  from '@/webrtc/message/MessageSenderPeerConnection';
import MessageReceiverPeerConnection
  from '@/webrtc/message/MessageReceiverPeerConnection';

// TODO move this to model
interface Message {
  content: string;
  roomId: number;
  uploadfiles: UploadFile[];
  originId: number;
  originTime: number;
}

interface UserIdConn {
  connectionId: string;
  userId: number;
}
export default class MessageTransferHandler extends BaseTransferHandler {

  protected readonly handlers: HandlerTypes = {
    removePeerConnection: <HandlerType>this.removePeerConnection
  };

  private sendingQueue: Message[] = [];

  private peerConnections: Record<string, MessagePeerConnection> = {};

  get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  private state: 'not_inited' | 'waiting' = 'not_inited';

  get connectionIds(): UserIdConn[] {
    let usersIds = this.room.users;
    let myConnectionId = this.wsHandler.getWsConnectionId();
    let connections = usersIds.reduce((connectionIdsWithUser, userId) => {
      let connectionIds: string[] = this.store.onlineDict[userId];
      connectionIds.forEach(connectionId => {
        if (connectionId !== myConnectionId) {
          connectionIdsWithUser.push({userId, connectionId});
        }
      });
      return connectionIdsWithUser;
    } , [] as UserIdConn[]);

    return connections;
  }

  async initConnection(connections: UserIdConn[]) {
    let myConnectionId = this.wsHandler.getWsConnectionId();
    let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
    connections.forEach(connectionIdWithUser => {
      let opponentWsId = connectionIdWithUser.connectionId;
      if (opponentWsId > myConnectionId) {
        let messageSenderPeerConnection = new MessageSenderPeerConnection(this.roomId, connId, opponentWsId, this.wsHandler, this.store,  connectionIdWithUser.userId);
        this.peerConnections[opponentWsId] = messageSenderPeerConnection;
        messageSenderPeerConnection.makeConnection();
      } else {
        let messageReceiverPeerConnection = new MessageReceiverPeerConnection(this.roomId, connId, opponentWsId, this.wsHandler, this.store, connectionIdWithUser.userId);
        this.peerConnections[opponentWsId] = messageReceiverPeerConnection;
        messageReceiverPeerConnection.waitForAnswer();
      }
    });
  }

  public async sendP2pMessage(
      content: string,
      roomId: number,
      uploadfiles: UploadFile[],
      originId: number,
      originTime: number
  ) {
    let connectionIds = this.connectionIds;
    if (this.state === 'not_inited') {
      if (this.connectionIds.length > 1) { // 1 is me, more = someone is present
        this.initConnection(connectionIds);
      } else {
        this.state = 'waiting';
      }
    }
    if (this.state === 'waiting') {
      this.sendingQueue.push({content, roomId, uploadfiles, originId, originTime});
    }
  }

}
