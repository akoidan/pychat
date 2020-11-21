import BaseTransferHandler from '@/ts/webrtc/BaseTransferHandler';
import {
  MessageSender,
  UploadFile,
  UserIdConn
} from '@/ts/types/types';
import {
  MessageModel,
  RoomModel
} from '@/ts/types/model';
import MessageSenderPeerConnection from '@/ts/webrtc/message/MessageSenderPeerConnection';
import MessageReceiverPeerConnection from '@/ts/webrtc/message/MessageReceiverPeerConnection';
import WsHandler from '@/ts/message_handlers/WsHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { sub } from '@/ts/instances/subInstance';
import Subscription from '@/ts/classes/Subscription';
import { MessageModelDto } from '@/ts/types/dto';
import {
  ChangeDevicesMessage,
  SyncP2PMessage
} from '@/ts/types/messages/innerMessages';
import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';


export default class MessageTransferHandler extends BaseTransferHandler implements MessageSender {

  protected readonly handlers: HandlerTypes<keyof MessageTransferHandler, 'message'> = {
    changeDevices: <HandlerType<'changeDevices', HandlerName>>this.changeDevices,
    removePeerConnection: <HandlerType<'removePeerConnection', HandlerName>>this.removePeerConnection
  };

  private state: 'not_inited' |'initing' | 'no_opponents' | 'ready' = 'not_inited';
  private readonly messageHelper: MessageHelper;

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, messageHelper: MessageHelper) {
    super(roomId, wsHandler, notifier, store);
    this.messageHelper = messageHelper;
    sub.subscribe('message', this);
  }

  async syncMessage(roomId: number, messageId: number): Promise<void> {
    this.messageHelper.processAnyMessage()
    if (await this.initConnectionIfRequired()) {
      let payload : SyncP2PMessage  = {
        action: 'syncP2pMessage',
        handler:  Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        id: messageId,
        allowZeroSubscribers: true
      }
      sub.notify(payload);
    }
  }

  public async acceptConnection(message: { connId: string }) {
    if (this.state === 'initing') {
      return
    }
    this.state = 'initing';
    this.connectionId = message.connId;
    this.refreshPeerConnections();
    this.state = 'ready';
  }

  public async syncMessages() {
    await this.initConnectionIfRequired();
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
          mpc = new MessageSenderPeerConnection(
              this.roomId,
              this.connectionId!,
              opponentWsId,
              this.wsHandler,
              this.store,
              connectionIdWithUser.userId,
              this.messageHelper
          );

        } else {
          mpc = new MessageReceiverPeerConnection(
              this.roomId,
              this.connectionId!,
              opponentWsId,
              this.wsHandler,
              this.store,
              connectionIdWithUser.userId,
              this.messageHelper
          );
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
    if (this.state === 'not_inited' || this.state === 'no_opponents') {
      if (this.connectionIds.length > 0) {
        this.state = 'initing';
        let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
        this.connectionId = connId;
        this.refreshPeerConnections();
        this.state = 'ready';
      } else {
        this.state = 'no_opponents';
      }
    }
    return this.state === 'ready';
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
    this.logger.debug('Evaluated {} connectionIds', connections)();
    return connections;
  }

  public changeDevices(m: ChangeDevicesMessage): void {
    if (m.roomId != null && this.roomId !== m.roomId) {
      return;
    } else if (m.userId != null) {
      if (this.room.users.indexOf(m.userId) < 0) {
        return;
      }
    } else {
      throw Error('WTF is this message');
    }
    if (this.state === 'not_inited') {
      this.initConnectionIfRequired()
    } else if (this.state !== 'initing') {
      this.refreshPeerConnections();
    }
  }

  addMessages(roomId: number, messages: MessageModelDto[]): void {
    this.store.growlError('The operation you\'re trying to do is not supported on p2p channel yet');
    throw Error('unsupported');
  }


}
