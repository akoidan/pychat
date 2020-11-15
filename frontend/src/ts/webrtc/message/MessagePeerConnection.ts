import AbstractPeerConnection from '@/ts/webrtc/AbstractPeerConnection';
import {
  DefaultMessage,
  EditMessage,
  InnerSendMessage,
  PrintWebRtcMessage
} from '@/ts/types/messages';
import WsHandler from '@/ts/message_handlers/WsHandler';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { sub } from '@/ts/instances/subInstance';
import {
  HandlerType,
  HandlerTypes,
  MessageSupplier,
  UploadFile
} from '@/ts/types/types';
import AbstractMessageProcessor from '@/ts/message_handlers/AbstractMessageProcessor';
import { SecurityValidator } from '@/ts/webrtc/message/SecurityValidator';
import Subscription from '@/ts/classes/Subscription';
import MessageRetrier from "@/ts/message_handlers/MessageRetrier";

export default abstract class MessagePeerConnection extends AbstractPeerConnection implements MessageSupplier {

  protected readonly handlers: HandlerTypes = {
    sendRtcData: <HandlerType>this.onsendRtcData,
    checkDestroy: <HandlerType>this.checkDestroy,
    sendSendMessage: <HandlerType>this.sendSendMessage,
    printMessage: <HandlerType>this.printMessage,
  };


  private readonly messageRetrier: MessageRetrier;
  private opponentUserId: number;
  protected status: 'inited' | 'not_inited' = 'not_inited';
  private readonly messageProc: AbstractMessageProcessor;
  private readonly securityValidator: SecurityValidator;


  constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, userId: number) {
    super(roomId, connId, opponentWsId, wsHandler, store);
    this.opponentUserId = userId;
    sub.subscribe(Subscription.allPeerConnectionsForTransfer(connId), this);
    this.messageRetrier = new MessageRetrier();
    this.securityValidator = new SecurityValidator(this.roomId, this.opponentUserId, store);
    this.messageProc = new AbstractMessageProcessor(this, store, `p2p-${opponentWsId}`);
  }

  private printMessage(m: PrintWebRtcMessage) {
    let em: EditMessage = {
      action: 'printMessage',
      content: m.content,
      edited: 0,
      handler: 'channels',
      id: m.id,
      messageId: m.messageId,
      roomId: this.roomId,
      time: Date.now() - m.timeDiff,
      userId: this.opponentUserId,
    }
    sub.notify(em)
  }

  private sendSendMessage({content, originId, uploadFiles, originTime, id}: InnerSendMessage) {
    this.messageRetrier.asyncExecuteAndPutInCallback(
        originId,
        () => {
          const message: PrintWebRtcMessage = {
            action: 'printMessage',
            content,
            edited: 0,
            timeDiff: Date.now() - originTime,
            messageId: originId,
            id,
            handler: 'this'
          };
          this.messageProc.sendToServer(message);
        }
    );
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

  // public appendQueue(message: AppendQueue) {
  //   if (this.isChannelOpened) {
  //     message.messages.forEach(message => {
  //       this.messageProc.sendToServer(message);
  //     })
  //   } else {
  //     this.sendingQueue.push(...message.messages);
  //   }
  // }

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
      this.messageRetrier.resendAllMessages();
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

  printSuccess() {

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
