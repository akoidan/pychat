import BaseTransferHandler from '@/webrtc/BaseTransferHandler';
import {
  HandlerType,
  HandlerTypes,
  UploadFile,
  UserIdConn
} from '@/types/types';
import { RoomModel } from '@/types/model';
import MessageSenderPeerConnection from '@/webrtc/message/MessageSenderPeerConnection';
import MessageReceiverPeerConnection from '@/webrtc/message/MessageReceiverPeerConnection';
import {
  AppendQueue,
  DefaultMessage,
  OfferCall,
  PrintWebRtcMessage
} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import NotifierHandler from '@/utils/NotificationHandler';
import { DefaultStore } from '@/utils/store';
import { sub } from '@/instances/subInstance';
import Subscription from '@/utils/Subscription';

export default class MessageTransferHandler extends BaseTransferHandler {



  protected readonly handlers: HandlerTypes = {
    removePeerConnection: <HandlerType>this.removePeerConnection,
    changeDevices: <HandlerType>this.changeDevices
  };

  private sendingQueue: DefaultMessage[] = [];

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore) {
    super(roomId, wsHandler, notifier, store);
    sub.subscribe('message', this);
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  protected onDestroy() {
    sub.unsubscribe('message', this);
  }

  private changeDevices(): void {

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

  public async acceptConnection(message: OfferCall) {
    this.state = 'initing';
    this.connectionId = message.connId;
    this.initConnection();
  }

  private initConnection() {
    let myConnectionId = this.wsHandler.getWsConnectionId();
    let newConnectionIdsWithUser = this.connectionIds;
    newConnectionIdsWithUser.forEach(connectionIdWithUser => {
      let opponentWsId = connectionIdWithUser.connectionId;
      if (this.webrtcConnnectionsIds.indexOf(opponentWsId) < 0) {
        let mpc;
        if (opponentWsId > myConnectionId) {
          mpc = new MessageSenderPeerConnection(this.roomId, this.connectionId!, opponentWsId, this.wsHandler, this.store,  connectionIdWithUser.userId);

        } else {
          mpc = new MessageReceiverPeerConnection(this.roomId, this.connectionId!, opponentWsId, this.wsHandler, this.store, connectionIdWithUser.userId);
        }
        this.webrtcConnnectionsIds.push(opponentWsId);
        mpc.makeConnection();
      }
    });
    let newConnectionIds: string[] = newConnectionIdsWithUser.map(a => a.connectionId);

    let connectionsToRemove = this.webrtcConnnectionsIds.filter(oldC => newConnectionIds.indexOf(oldC) < 0);
    sub.notify({
      action: 'checkDestroy',
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
    });
    this.flushQueue();
  }


  printMessage(message: PrintWebRtcMessage) {

  }

  private flushQueue() {
    let message: AppendQueue = {
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
      action: 'appendQueue',
      messages: this.sendingQueue
    };
    sub.notify(message);

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
    const em: PrintWebRtcMessage = {
      action: 'printMessage',
      content,
      edited: 0,
      timeDiff: Date.now() - time,
      messageId: originId, // should be -
      id: Date.now(),
      handler: 'this'
    }
    this.sendingQueue.push(em);
    if (this.state === 'not_inited') {
      this.state = 'initing';
      if (this.connectionIds.length > 0) {
        let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
        this.connectionId = connId;
        this.initConnection();
      } else {
        this.state = 'waiting';
      }
    }
  }

}
