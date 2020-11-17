import { Logger } from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import {
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { LogoutMessage } from '@/ts/types/messages/innerMessages';
import { sub } from '@/ts/instances/subInstance';

export default class MessageRetrier extends MessageHandler {
  protected handlers: HandlerTypes<keyof MessageRetrier, 'any'> = {
    logout: <HandlerType<'logout', 'any'>>this.removeAllSendingMessages
  };

  protected readonly logger: Logger;
  private readonly sendingQueue: Record<string, Function> = {};

  constructor() {
    super()
    sub.subscribe('any', this)
    this.logger = loggerFactory.getLoggerColor('retrier', '#cd0459')
  }

  public putCallBack(id: number, fn: () => void) {
    this.sendingQueue[id] = fn;
  }

  public logout(m: LogoutMessage) {
    this.removeAllSendingMessages();
}
  public removeAllSendingMessages(): void {
    let ids: string[] = Object.keys(this.sendingQueue);
    ids.forEach((id: string) => this.removeSendingMessage(parseInt(id, 10)));
    this.logger.log('Flushed {} sending messages', ids.length);
  }

  public asyncExecuteAndPutInCallback(id: number, fn: () => void) {
    this.sendingQueue[id] = fn;
    this.sendingQueue[id]();
  }

  public resendAllMessages() {
    for (const k in this.sendingQueue) {
      this.resendMessage(parseInt(k));
    }
  }

  public resendMessage(id: number) {
    this.logger.log('resending message {} ', id)();
    this.sendingQueue[id]();
  }

  public removeSendingMessage(messageId: number | undefined) {
    if (messageId && this.sendingQueue[messageId]) {
      delete this.sendingQueue[messageId];

      return true;
    } else if (!messageId) {
      this.logger.warn('Got unknown message {}', messageId)();

      return false;
    } else {
      throw Error(`Unknown message ${messageId}`);
    }
  }
}