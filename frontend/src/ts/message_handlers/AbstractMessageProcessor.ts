import { Logger } from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import { MessageSupplier } from '@/ts/types/types';
import type { DefaultStore } from '@/ts/classes/DefaultStore';
import { sub } from '@/ts/instances/subInstance';
import { DefaultWsOutMessage } from '@/ts/types/messages/wsOutMessages';
import {
  DefaultWsInMessage,
  GrowlMessage
} from '@/ts/types/messages/wsInMessages';
import {
  DefaultInMessage,
  DefaultMessage,
  HandlerName
} from '@/ts/types/messages/baseMessagesInterfaces';

export default class AbstractMessageProcessor {

  private readonly target: MessageSupplier;

  private readonly store: DefaultStore;

  private readonly callBacks: { [id: number]: {resolve: Function; reject: Function} } = {};
  protected readonly logger: Logger;


  // also uniqueMessageId is used on sendingMessage, in storage.getUniqueMessageId.
  // the difference is that this is positive integers
  // and another one uses negatives
  private uniquePositiveMessageId: number = 100_000_000; // 100_000_000 - 200_000_000
  private readonly loggerIn: Logger;
  private readonly loggerOut: Logger;

  constructor(target: MessageSupplier, store: DefaultStore, label: string) {
    this.target = target;
    this.store = store;
    this.loggerIn = loggerFactory.getLoggerColor(`${label}:in`, '#2e631e');
    this.loggerOut = loggerFactory.getLoggerColor(`${label}:out`, '#2e631e');
    this.logger = loggerFactory.getLoggerColor('mes-proc', '#2e631e');
  }

  private logData(logger: Logger, jsonData: string, message: DefaultMessage<string>) {
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

  public parseMessage(jsonData: string): DefaultWsInMessage<string, HandlerName>|null {
    let data: DefaultWsInMessage<string, HandlerName>|null = null;
    try {
      data = JSON.parse(jsonData);
      this.logData(this.loggerIn, jsonData, data!);
    } catch (e) {
      this.logger.error('Unable to parse incomming message {}', jsonData)();

      return null;
    }
    if (!data?.handler || !data.action) {
      this.logger.error('Invalid message structure')();

      return null;
    }
    return data;
  }

  public handleMessage(data: DefaultWsInMessage<string, HandlerName>) {
    if (data.handler !== 'void' && data.action !== 'growlError') {
      sub.notify(data);
    }
    if (data.cbId && this.callBacks[data.cbId] && (!data.cbBySender || data.cbBySender === this.target.getWsConnectionId())) {
      this.logger.debug('resolving cb')();
      if (data.action === 'growlError') {
        this.callBacks[data.cbId].reject(Error((data as unknown as GrowlMessage).content));
      } else {
        this.callBacks[data.cbId].resolve(data);
      }
      delete this.callBacks[data.cbId];
    } else if (data.action === 'growlError') {
      // growlError is used only in case above, so this is just a fallback that will never happen
      this.store.growlError((data as unknown as GrowlMessage).content);
    }
  }

  public sendToServerAndAwait<T extends DefaultWsOutMessage<K>, K extends string> (message: T): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!message.cbId) {
        message.cbId = this.uniquePositiveMessageId++;
      }
      const jsonMessage = this.getJsonMessage(message);
      this.callBacks[message.cbId!] = {resolve, reject}
      let isSent = this.target.sendRawTextToServer(jsonMessage);
      if (isSent) {
        this.logData(this.loggerOut, jsonMessage, message);
      }
    })


  }

  sendToServer(message: DefaultWsOutMessage<string>): boolean {
    let jsonMessage = this.getJsonMessage(message);
    let isSent = this.target.sendRawTextToServer(jsonMessage);
    if (isSent) {
      this.logData(this.loggerOut, jsonMessage, message);
    }
    return isSent;
  }

  public getJsonMessage(message: DefaultWsOutMessage<string>) {
    return JSON.stringify(message);
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
