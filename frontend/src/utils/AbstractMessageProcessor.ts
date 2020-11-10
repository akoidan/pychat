import {
  DefaultMessage,
  DefaultSentMessage,
  GrowlMessage
} from '@/types/messages';
import { Logger } from 'lines-logger';
import {sub} from '@/utils/sub';
import loggerFactory from '@/utils/loggerFactory';
import {MessageSupplier} from '@/types/types';
import {DefaultStore} from '@/utils/store';
import {getUniqueId} from '@/utils/pureFunctions';

export default class AbstractMessageProcessor {

  private messageId: number = 0;

  private readonly target: MessageSupplier;

  private readonly store: DefaultStore;

  private readonly callBacks: { [id: number]: {resolve: Function; reject: Function} } = {};
  protected readonly logger: Logger;

  private readonly loggerIn: Logger;
  private readonly loggerOut: Logger;

  constructor(target: MessageSupplier, store: DefaultStore, label: string) {
    this.target = target;
    this.store = store;
    this.loggerIn = loggerFactory.getLoggerColor(`${label}:in`, '#2e631e');
    this.loggerOut = loggerFactory.getLoggerColor(`${label}:out`, '#2e631e');
    this.logger = loggerFactory.getLoggerColor('mes-proc', '#2e631e');

  }

  private logData(logger: Logger, jsonData: string, message: DefaultSentMessage) {
    let raw = jsonData;
    if (raw.length > 1000) {
      raw = '';
    }
    if (message.action === 'ping' || message.action === 'pong') {
      logger.debug('{} {}', raw, message)();
    } else {
      logger.log('{} {}', raw, message)();
    }
  }

  public onMessage(jsonData: string) {
    let data: DefaultMessage;
    try {
      data = JSON.parse(jsonData);
      this.logData(this.loggerIn, jsonData, data);
    } catch (e) {
      this.logger.error('Unable to parse incomming message {}', jsonData)();

      return;
    }
    if (!data.handler || !data.action) {
      this.logger.error('Invalid message structure')();

      return;
    }
    this.handleMessage(data);
  }

  private handleMessage(data: DefaultMessage) {
    if (data.handler !== 'void' && data.action !== 'growlError') {
      sub.notify(data);
    }
    if (data.messageId && this.callBacks[data.messageId] && (!data.cbBySender || data.cbBySender === this.target.getWsConnectionId())) {
      this.logger.debug('resolving cb')();
      if (data.action === 'growlError') {
        this.callBacks[data.messageId].reject(Error((data as GrowlMessage).content));
      } else {
        this.callBacks[data.messageId].resolve(data);
      }
      delete this.callBacks[data.messageId];
    } else if (data.action === 'growlError') {
      // growlError is used only in case above, so this is just a fallback that will never happen
      this.store.growlError((data as GrowlMessage).content);
    }
  }

  public sendToServerAndAwait<T extends DefaultSentMessage> (message: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const jsonMessage = this.getJsonMessage(message);
      this.callBacks[message.messageId!] = {resolve, reject}
      let isSent = this.target.sendRawTextToServer(jsonMessage);
      if (isSent) {
        this.logData(this.loggerOut, jsonMessage, message);
      }
    })


  }

  sendToServer(message: DefaultSentMessage): boolean {
    let jsonMessage = this.getJsonMessage(message);
    let isSent = this.target.sendRawTextToServer(jsonMessage);
    if (isSent) {
      this.logData(this.loggerOut, jsonMessage, message);
    }
    return isSent;
  }

  public getJsonMessage(message: DefaultSentMessage) {
    if (!message.messageId) {
      message.messageId = getUniqueId();
    }
    return  JSON.stringify(message);
  }

  public onDropConnection(reasong: string) {
    for (const cb in this.callBacks) {
      try {
        this.logger.debug('Resolving cb {}', cb)();
        const cbFn = this.callBacks[cb];
        delete this.callBacks[cb];
        cbFn.reject(reasong);
        this.logger.debug('Cb {} has been resolved', cb)();
      } catch (e) {
        this.logger.debug('Error {} during resolving cb {}', e, cb)();
      }
    }
  }

}
