import AbstractPeerConnection from '@/webrtc/AbstractPeerConnection';
import {DefaultMessage} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import {DefaultStore} from '@/utils/store';
import {sub} from '@/utils/sub';
import {MessageSupplier} from '@/types/types';
import AbstractMessageProcessor from '@/utils/AbstractMessageProcessor';
import {SecurityValidator} from '@/webrtc/message/SecurityValidator';

export default abstract class MessagePeerConnection extends AbstractPeerConnection implements MessageSupplier {
  private opponentUserId: number;
  private sendingQueue: DefaultMessage[] = [];
  protected status: 'inited' | 'not_inited' = 'not_inited';
  private readonly messageProc: AbstractMessageProcessor;
  private readonly securityValidator: SecurityValidator;


  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, userId: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.opponentUserId = userId;
    this.securityValidator = new SecurityValidator(this.roomId, this.opponentUserId, store);
    this.messageProc = new AbstractMessageProcessor(this, store, `p2p-${opponentWsId}`);
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

  public appendQueue(...messages: DefaultMessage[]) {
    if (this.isChannelOpened) {
      messages.forEach(message => {
        this.messageProc.sendToServer(message);
      })
    } else {
      this.sendingQueue.push(...messages);
    }
  }

  get isChannelOpened(): boolean {
    return this.sendChannel?.readyState === 'open';
  }

  protected onChannelMessage(event: MessageEvent) {
    let data = this.messageProc.parseMessage(event.data);
    if (data) {
      this.securityValidator.validate(data);
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
