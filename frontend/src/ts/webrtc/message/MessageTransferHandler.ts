import BaseTransferHandler from '@/ts/webrtc/BaseTransferHandler';
import {
  HandlerType,
  HandlerTypes,
  MessageSender,
  UploadFile,
  UserIdConn
} from '@/ts/types/types';
import { RoomModel } from '@/ts/types/model';
import MessageSenderPeerConnection from '@/ts/webrtc/message/MessageSenderPeerConnection';
import MessageReceiverPeerConnection from '@/ts/webrtc/message/MessageReceiverPeerConnection';
import {
  ChangeDevicesMessage,
  DefaultMessage,
  InnerSendMessage,
  OfferCall
} from '@/ts/types/messages';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';
import MessageRetrier from '@/ts/message_handlers/MessageRetrier';
import { MessageModelDto } from "@/ts/types/dto";

export default class MessageTransferHandler extends BaseTransferHandler implements MessageSender {


  protected readonly handlers: HandlerTypes = {
    removePeerConnection: <HandlerType>this.removePeerConnection,
    changeDevices: <HandlerType>this.changeDevices
  };

  private messageRetrier: MessageRetrier;
  private state: 'not_inited' |'initing' | 'waiting' | 'ready' = 'not_inited';

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore) {
    super(roomId, wsHandler, notifier, store);
    sub.subscribe('message', this);
    this.messageRetrier = new MessageRetrier();
  }

  public async acceptConnection(message: OfferCall) {
    this.state = 'initing';
    this.connectionId = message.connId;
    this.refreshPeerConnections();
    this.state = 'ready';
    this.messageRetrier.resendAllMessages();
  }

  protected onDestroy() {
    sub.unsubscribe('message', this);
  }

  private refreshPeerConnections() {
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
  }

  private async initConnectionIfRequired() {
    if (this.state === 'not_inited') {
      this.state = 'initing';
      if (this.connectionIds.length > 0) {
        let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
        this.connectionId = connId;
        this.state = 'ready'
        this.refreshPeerConnections();
        return true;
      } else {
        this.state = 'waiting';
      }
    } else if (this.state === 'ready') {
      return true;
    }
    return false;
  }

  public async tryToSend(originId: number, m: Omit<DefaultMessage, 'handler'>) {
    this.messageRetrier.putCallBack(originId, () => {
      let message: DefaultMessage = {...m, handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!)}
      sub.notify(message);
    })
    await this.initConnectionIfRequired();
    if (this.state === 'ready') {
      this.messageRetrier.resendMessage(originId);
    }
  }


  async sendSendMessage(content: string, roomId: number, uploadFiles: UploadFile[], originId: number, originTime: number): Promise<void> {
    const em: Omit<InnerSendMessage, 'handler'> = {
      content,
      originTime,
      originId,
      id: Date.now(),
      action: 'sendSendMessage',
      uploadFiles,
    }
    await this.tryToSend(originId, em);
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }


  private get connectionIds(): UserIdConn[] {
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

  private changeDevices(m: ChangeDevicesMessage): void {
    if (m.roomId != null && this.roomId !== m.roomId) {
      return;
    } else if (m.userId != null) {
      if (this.room.users.indexOf(m.userId) < 0) {
        return;
      }
    } else {
      throw Error('WTF is this message');
    }
    this.refreshPeerConnections();
  }

  addMessages(roomId: number, messages: MessageModelDto[]): void {
    this.store.growlError("The operation you're trying to do is not supported on p2p channel yet");
    throw Error("unsupported");
  }

  getMessageRetrier(): MessageRetrier {
    this.store.growlError("The operation you're trying to do is not supported on p2p channel yet");
    throw Error("unsupported");
  }

  sendDeleteMessage(id: number, originId: number): void {
    this.store.growlError("The operation you're trying to do is not supported on p2p channel yet");
    throw Error("unsupported");
  }

  sendEditMessage(content: string, roomId: number, id: number, uploadFiles: UploadFile[]): Promise<void> {
    this.store.growlError("The operation you're trying to do is not supported on p2p channel yet");
    throw Error("unsupported");
  }




}
