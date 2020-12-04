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
  ChangeP2pRoomInfoMessage,
  InternetAppearMessage,
  SyncP2PMessage
} from '@/ts/types/messages/innerMessages';
import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';

/**
 *
 * https://drive.google.com/file/d/1BCtFNNWprfobqQlG4n2lPyWEqroi7nJh/view
 */
export default class MessageTransferHandler extends BaseTransferHandler implements MessageSender {

  protected readonly handlers: HandlerTypes<keyof MessageTransferHandler, 'webrtc-message'> = {
  };

  private state: 'not_inited' |'initing' | 'ready' = 'not_inited';
  private readonly messageHelper: MessageHelper;

  constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, messageHelper: MessageHelper) {
    super(roomId, wsHandler, notifier, store);
    this.messageHelper = messageHelper;
  }

  async syncMessage(roomId: number, messageId: number): Promise<void> {
    this.messageHelper.processAnyMessage()
    if (this.state === 'ready') {
      let payload : SyncP2PMessage  = {
        action: 'syncP2pMessage',
        handler:  Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        id: messageId,
        allowZeroSubscribers: true
      }
      sub.notify(payload);
    }
  }


  public destroyThisTransferHandler() {
    sub.notify({
      action: 'checkDestroy',
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
    });
  }

  public async init() {
    if (this.state === 'not_inited') {
      this.state = 'initing';
      try {
        let {connId} =  await this.wsHandler.offerMessageConnection(this.roomId);
        if (!connId) {
          throw Error('Error during setting connection ID');
        }
        // @ts-ignore: next-line
        if (this.state !== 'ready') { // already inited in another place, like in accept connection
          this.setConnectionId(connId);
          this.state = 'ready';
          await this.refreshPeerConnections();
        }
      } catch (e) {
        this.state = 'not_inited';
      }
    }
  }

  public async initOrSync() {
    // if state is initing, refresh connection will be triggered when it finishes
    if (this.state === 'not_inited') { // if it's not inited , refresh connection wil trigger inside this init()
      await this.init();
    } else if (this.state === 'ready') { // if it's ready, we should check if new devices appeard while we were offline
      this.refreshPeerConnections();
    }
  }

  public async acceptConnection({ connId }: {connId: string}) {
    // if connection is initing, we make it ready, so init would not refresh connection again
    // if connection is not_inited, this assignments initializes it.
    // if connection is ready already, we should refresh the connection to create a new PeerConnection for opponent device
    this.setConnectionId(connId);
    this.state = 'ready';
    // this means user probably appears online, we should refresh connections
    this.refreshPeerConnections();
  }

  public refreshPeerConnections() {
    let myConnectionId = this.wsHandler.getWsConnectionId();
    let newConnectionIdsWithUser = this.connectionIds;
    newConnectionIdsWithUser.forEach(connectionIdWithUser => {
      let opponentWsId = connectionIdWithUser.connectionId;
      if (sub.getNumberOfSubscribers(Subscription.getPeerConnectionId(this.connectionId!, opponentWsId)) == 0) {
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
        mpc.makeConnection();
      }
    });
    // let newConnectionIds: string[] = newConnectionIdsWithUser.map(a => a.connectionId);

    // let connectionsToRemove = this.webrtcConnnectionsIds.filter(oldC => newConnectionIds.indexOf(oldC) < 0);
    sub.notify({
      action: 'checkDestroy',
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
      allowZeroSubscribers: true
    });
  }



  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  private get connectionIds(): UserIdConn[] {
    if (!this.room) {
      return []
    }
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


  addMessages(roomId: number, messages: MessageModelDto[]): void {
    this.store.growlError('The operation you\'re trying to do is not supported on p2p channel yet');
    throw Error('unsupported');
  }

  addSearchMessages(roomId: number, messages: MessageModelDto[]): void {
    this.store.growlError('The operation you\'re trying to do is not supported on p2p channel yet');
    throw Error('unsupported');
  }


}
