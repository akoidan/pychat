import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';
import {
  AppendQueue,
  DefaultMessage
} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import { DefaultStore } from '@/utils/store';
import { sub } from '@/instances/subInstance';
import {
  HandlerType,
  HandlerTypes,
  MessageSupplier
} from '@/types/types';
import AbstractMessageProcessor from '@/utils/AbstractMessageProcessor';
import { SecurityValidator } from '@/webrtc/message/SecurityValidator';
import Subscription from '@/utils/Subscription';

export default abstract class MessagePeerConnection extends AbstractPeerConnection implements MessageSupplier {

  protected readonly handlers: HandlerTypes = {
    sendRtcData: <HandlerType>this.onsendRtcData,
    appendQueue: <HandlerType>this.appendQueue,
    checkDestroy: <HandlerType>this.checkDestroy,
  };

  private opponentUserId: number;
  private sendingQueue: DefaultMessage[] = [];
  protected status: 'inited' | 'not_inited' = 'not_inited';
  private readonly messageProc: AbstractMessageProcessor;
  private readonly securityValidator: SecurityValidator;


  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, userId: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.opponentUserId = userId;
    sub.subscribe(Subscription.allPeerConnectionsForTransfer(connId), this);
    this.securityValidator = new SecurityValidator(this.roomId, this.opponentUserId, store);
    this.messageProc = new AbstractMessageProcessor(this, store, `p2p-${opponentWsId}`);
  }

  public getOpponentUserId() {
    return this.opponentUserId;
  }

  public onDestroy(reason?: string) {
    super.onDestroy(reason);
    sub.unsubscribe(Subscription.allPeerConnectionsForTransfer(this.connectionId), this);
  }

  abstract makeConnection(): void;

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`)
    if (this.pc!.iceConnectionState === 'disconnected' ||
        this.pc!.iceConnectionState === 'failed' ||
        this.pc!.iceConnectionState === 'closed') {
      this.closeEvents('Connection has been lost');
    }
  }

  checkDestroy() {
    //destroy only if user has left this room, if he's offline but connections is stil in progress,
    // maybe he has jost connection to server but not to us
    if (this.store.roomsDict[this.roomId].users.indexOf(this.opponentUserId) < 0) {
      this.onDestroy("User has left this room")
    }
  }

  public appendQueue(message: AppendQueue) {
    if (this.isChannelOpened) {
      message.messages.forEach(message => {
        this.messageProc.sendToServer(message);
      })
    } else {
      this.sendingQueue.push(...message.messages);
    }
  }

  get isChannelOpened(): boolean {
    return this.sendChannel?.readyState === 'open';
  }

  protected onChannelMessage(event: MessageEvent) {
    let data = this.messageProc.parseMessage(event.data);
    if (data) {
      this.securityValidator.validate(data);
      if (data.handler === 'this') {
        data.handler = this.mySubscriberId;
      }
      this.messageProc.handleMessage(data);
    }
  }

  public setupEvents() {

    this.sendChannel!.onmessage = this.onChannelMessage.bind(this);
    this.sendChannel!.onopen = () => {
      while (this.sendingQueue.length > 0) {
        this.messageProc.sendToServer(this.sendingQueue.pop()!);
      }
      this.logger.debug('Channel opened')();
    };
    this.sendChannel!.onclose = () => this.logger.log('Closed channel ')();
  }

  public closeEvents (text?: string|DefaultMessage) {
    this.messageProc.onDropConnection('data channel lost')
    if (text) {
      this.ondatachannelclose(<string>text); // TODO
    }
    this.logger.error('Closing event from {}', text)();
    this.closePeerConnection();
    if (this.sendChannel && this.sendChannel.readyState !== 'closed') {
      this.logger.log('Closing chanel')();
      this.sendChannel.close();
    } else {
      this.logger.log('No channels to close')();
    }
  }


  getWsConnectionId(): string {
    return this.wsHandler.getWsConnectionId();
  }

  sendRawTextToServer(message: string): boolean {
    if (this.isChannelOpened) {
      this.sendChannel!.send(message);
      return true;
    } else {
      return false;
    }
  }
}
