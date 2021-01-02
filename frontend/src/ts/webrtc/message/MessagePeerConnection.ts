import AbstractPeerConnection from '@/ts/webrtc/AbstractPeerConnection';
import WsHandler from '@/ts/message_handlers/WsHandler';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { sub } from '@/ts/instances/subInstance';
import { MessageSupplier } from '@/ts/types/types';
import { P2PMessageProcessor } from '@/ts/message_handlers/P2PMessageProcessor';
import Subscription from '@/ts/classes/Subscription';

import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import {
  DefaultP2pMessage,
  ExchangeMessageInfoRequest,
  ExchangeMessageInfoResponse,
  P2PHandlerType,
  P2PHandlerTypes,
  ConfirmReceivedP2pMessage,
  SendNewP2PMessage,
  ExchangeMessageInfoResponse2,
  ExchangeMessageInfoResponse3,
} from '@/ts/types/messages/p2pMessages';
import { DefaultWsInMessage } from '@/ts/types/messages/wsInMessages';
import {
  MessageModel,
  RoomModel
} from '@/ts/types/model';
import {
  MessageP2pDto,
  MessagesInfo
} from '@/ts/types/messages/p2pDto';
import {
  messageModelToP2p,
  p2pMessageToModel
} from '@/ts/types/converters';
import {
  CheckTransferDestroy,
  SyncP2PMessage
} from '@/ts/types/messages/innerMessages';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';
import loggerFactory from '@/ts/instances/loggerFactory';

export default abstract class MessagePeerConnection extends AbstractPeerConnection implements MessageSupplier {

  protected readonly handlers: HandlerTypes<keyof MessagePeerConnection, 'peerConnection:*'> = {
    sendRtcData: <HandlerType<'sendRtcData', 'peerConnection:*'>>this.sendRtcData,
    checkDestroy: <HandlerType<'checkDestroy', 'peerConnection:*'>>this.checkDestroy,
    syncP2pMessage: <HandlerType<'syncP2pMessage', 'peerConnection:*'>>this.syncP2pMessage
  };

  connectedToRemote: boolean = true;

  protected status: 'inited' | 'not_inited' = 'not_inited';

  private readonly p2pHandlers: P2PHandlerTypes<keyof MessagePeerConnection> = {
    exchangeMessageInfoRequest: <P2PHandlerType<'exchangeMessageInfoRequest'>>this.exchangeMessageInfoRequest,
    sendNewP2PMessage: <P2PHandlerType<'sendNewP2PMessage'>>this.sendNewP2PMessage
  };

  private readonly messageProc: P2PMessageProcessor;
  private readonly opponentUserId: number;
  private readonly messageHelper: MessageHelper;
  private syncMessageLock: boolean = false;

  constructor(
      roomId: number,
      connId: string,
      opponentWsId: string,
      wsHandler: WsHandler,
      store: DefaultStore,
      userId: number,
      messageHelper: MessageHelper
  ) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.opponentUserId = userId;
    this.logger = loggerFactory.getLoggerColor(`peer:${this.connectionId}:${this.opponentWsId}`, '#4c002b');
    this.messageProc = new P2PMessageProcessor(this, store, `peer:${connId}:${opponentWsId}`);
    this.messageHelper = messageHelper;
  }

  public getOpponentUserId() {
    return this.opponentUserId;
  }

  abstract makeConnection(): void;

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`)
    if (this.pc!.iceConnectionState === 'disconnected' ||
        this.pc!.iceConnectionState === 'failed' ||
        this.pc!.iceConnectionState === 'closed') {
      this.logger.error('Connection has changed to state {}', this.pc!.iceConnectionState)();
      //TODO do we need to close?
    } else {
      this.logger.debug('ice connection -> ', this.pc!.iceConnectionState)();
    }
  }

  public async sendNewP2PMessage(payload: SendNewP2PMessage) {
    let message: MessageModel = p2pMessageToModel(payload.message, this.roomId);
    this.messageHelper.processUnkownP2pMessage(message);

    let response: ConfirmReceivedP2pMessage = {
      action: 'confirmReceivedP2pMessage',
      resolveCbId: payload.cbId
    };
    this.messageProc.sendToServer(response);
  }

  public async syncP2pMessage(payload: SyncP2PMessage) {
    if (this.isChannelOpened) {
      this.logger.debug("Syncing message {}", payload.id)()
      let message: SendNewP2PMessage = {
        message: messageModelToP2p(this.room.messages[payload.id]),
        action: 'sendNewP2PMessage',
      }
      await this.messageProc.sendToServerAndAwait(message);
      if (!this.isConnectedToMyAnotherDevices) {
        this.store.markMessageAsSent({messagesId: [payload.id], roomId: this.roomId});
      }
    }
  }

  get isConnectedToMyAnotherDevices(): boolean {
    return this.opponentUserId === this.store.myId;
  }

  public checkDestroy() {
    //destroy only if user has left this room, if he's offline but connections is stil in progress,
    // maybe he has jost connection to server but not to us
    if (!this.room || !this.room.p2p) {
      this.unsubscribeAndRemoveFromParent();
    } else if (this.room.users.indexOf(this.opponentUserId) < 0) {
      this.unsubscribeAndRemoveFromParent();
    }
  }

  public async exchangeMessageInfoRequest(payload: ExchangeMessageInfoRequest) {
    if (this.syncMessageLock) {
      this.logger.error("oops we already acquired lock, going to syncanyway")
    }
    this.logger.debug("Processing exchangeMessageInfoRequest")();
    try {
      this.syncMessageLock = true;

      let missingIdsFromRemote: number[] = [];
      let responseMessages: MessageP2pDto[] = []

      this.messages.forEach(message => {
        let opponentEditedCount: number = payload.messagesInfo[message.id] ?? 0;
        if (payload.messagesInfo[message.id] !== undefined) {
          let myEditedCount: number = message.edited;
          if (myEditedCount > opponentEditedCount) {
            responseMessages.push(messageModelToP2p(message))
          } else if (myEditedCount < opponentEditedCount) {
            missingIdsFromRemote.push(message.id)
          } // else message are synced
        } else {
          responseMessages.push(messageModelToP2p(message))
        }
      })
      Object.keys(payload.messagesInfo).forEach(remoteMId => {
        if (!this.room.messages[remoteMId as unknown as number]) { // convertion is automatic for js
          missingIdsFromRemote.push(parseInt(remoteMId))
        }
      })
      let response: ExchangeMessageInfoResponse = {
        action: 'exchangeMessageInfoResponse',
        resolveCbId: payload.cbId,
        messages: responseMessages,
        requestMessages: missingIdsFromRemote,
      }
      let a: ExchangeMessageInfoResponse2 = await this.messageProc.sendToServerAndAwait(response);
      // got exchangeMessageInfoResponse2
      this.saveMessagesDtoToStore(a.messages);
      this.markAsReadSentMessages(responseMessages);
      let confirmationThatReceived: ExchangeMessageInfoResponse3 = {
        action: 'exchangeMessageInfoResponse3',
        resolveCbId: a.cbId
      }
      this.messageProc.sendToServer(confirmationThatReceived);
    } finally {
      this.syncMessageLock = false;
    }

  }


  public async syncMessages() {
    if (this.syncMessageLock) {
      this.logger.warn('Exiting from sync message because, the lock is already acquired')();
      return;
    }
    try {
      this.syncMessageLock = true;
      await this.exchangeMessageInfo();
    } catch (e) {
      this.logger.error('Can\'t send messages because {}', e)();
    } finally {
      this.syncMessageLock = false;
    }
  }

  public unsubscribeAndRemoveFromParent() {
    super.unsubscribeAndRemoveFromParent();
    this.messageProc.onDropConnection('data channel lost');
  }

  public getWsConnectionId(): string {
    return this.wsHandler.getWsConnectionId();
  }

  public sendRawTextToServer(message: string): boolean {
    if (this.isChannelOpened) {
      this.sendChannel!.send(message);
      return true;
    } else {
      return false;
    }
  }


  protected setupEvents() {

    this.sendChannel!.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel!.onopen = () => {
      this.logger.log('Channel opened')();
      if (this.getWsConnectionId() > this.opponentWsId) {
        this.syncMessages();
      }
      this.store.addLiveConnectionToRoom({connection:  this.opponentWsId, roomId: this.roomId});
    };
    this.sendChannel!.onclose = () => {
      this.logger.log('Closed channel ')();
      //this.syncMessageLock = false; // just for the case, not nessesary
      this.messageProc.onDropConnection('Data channel closed');
      if (this.store.userInfo) {
        // otherwise we logged out
        this.store.removeLiveConnectionToRoom({connection:  this.opponentWsId, roomId: this.roomId});
      }
    }
  }

  protected onChannelMessage(event: MessageEvent) {
    let data: DefaultP2pMessage<keyof MessagePeerConnection> = this.messageProc.parseMessage(event.data) as unknown as DefaultP2pMessage<keyof MessagePeerConnection>;
    if (data) {
      let cb = this.messageProc.resolveCBifItsThere(data);
      if (!cb) {
        const handler: P2PHandlerType<keyof MessagePeerConnection> = this.p2pHandlers[data.action] as P2PHandlerType<keyof MessagePeerConnection>;
        if (handler) {
          handler.bind(this)(data);
        } else {
          this.logger.error(`{} can't find handler for {}, available handlers {}. Message: {}`, this.constructor.name, data.action, Object.keys(this.p2pHandlers), data)();
        }
      }
    }
  }


  private async exchangeMessageInfo() {
    if (this.isChannelOpened) {
      let mI: MessagesInfo = this.messages.reduce((p, c) => {
        p[c.id!] = c.edited ?? 0; // (undefied|null) ?? 0 === 0
        return p;
      }, {} as MessagesInfo);
      let message: ExchangeMessageInfoRequest = {
        action: 'exchangeMessageInfoRequest',
        messagesInfo: mI
      };
      let response: ExchangeMessageInfoResponse = await this.messageProc.sendToServerAndAwait(message);
      // got exchangeMessageInfoResponse
      this.saveMessagesDtoToStore(response.messages);
      let responseMessages: MessageP2pDto[] = response.requestMessages.map(
          id => messageModelToP2p(this.room.messages[id])
      );
      let responseToRequest: ExchangeMessageInfoResponse2 = {
        resolveCbId: response.cbId,
        messages: responseMessages, // we need to resolve callback even if messages are empty
        action: 'exchangeMessageInfoResponse2'
      }
      await this.messageProc.sendToServerAndAwait(responseToRequest);
      this.markAsReadSentMessages(responseMessages);
    } else {
      throw Error("No connection");
    }
  }

  private markAsReadSentMessages(responseMessages: MessageP2pDto[]) {
    if (!this.isConnectedToMyAnotherDevices) {
      let isNotRead: number[] = responseMessages.map(m => m.id).filter(id => this.room.messages[id].status === 'sending');
      if (isNotRead.length > 0) {
        this.store.markMessageAsSent({messagesId: isNotRead, roomId: this.roomId});
      }
    }
  }

  private saveMessagesDtoToStore(messageP2pDtos: MessageP2pDto[]) {
    let messageModels: MessageModel[] = messageP2pDtos.map(rp => p2pMessageToModel(rp, this.roomId));
    if (messageModels.length > 0) {
      this.store.addMessages({
        messages: messageModels,
        roomId: this.roomId
      });
    }
  }

  private get isChannelOpened(): boolean {
    return this.sendChannel?.readyState === 'open';
  }

  private get messages(): MessageModel[] {
    return Object.values(this.room.messages);
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }
}
