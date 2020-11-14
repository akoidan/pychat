import {
  DefaultMessage,
  HandlerName
} from '@/types/messages';
import { IMessageHandler } from '@/types/types';
import loggerFactory from '@/utils/loggerFactory';
import { Logger } from 'lines-logger';

export default class Subscription {

  public channels: Partial<Record<HandlerName, IMessageHandler[]>> = {};
  private readonly logger: Logger;

  constructor() {
    this.logger = loggerFactory.getLoggerColor('sub', '#3a7a7a');
  }

  public static getPeerConnectionId(connectionId: string, opponentWsId: string): HandlerName {
    return `peerConnection:${connectionId}:${opponentWsId}` as HandlerName;
  }

  public static allPeerConnectionsForTransfer(connectionId: string): HandlerName {
    return `peerConnection:${connectionId}:ALL_OPPONENTS` as HandlerName;
  }

  public static getTransferId(connectionId: string): HandlerName {
    return `webrtcTransfer:${connectionId}` as HandlerName;
  }

  public subscribe(channel: HandlerName, messageHandler: IMessageHandler) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    if (this.channels[channel]!.indexOf(messageHandler) < 0) {
      this.logger.debug('subscribing to {}, subscriber {}', channel, messageHandler)();
      this.channels[channel]!.push(messageHandler);
    }
  }

  public unsubscribe(channel: HandlerName, handler: IMessageHandler) {
    const c = this.channels[channel];

    if (c) {
      let index = c.indexOf(handler);
      if (index >= 0) {
        this.logger.debug('Unsubscribing from channel {}', channel)();
        c.splice(index, 1);
        return;
      }
    }
    this.logger.error('Unable to find channel to delete {}', channel)();
  }

  public notify<T extends DefaultMessage>(message: T): boolean {
    if (message.handler === 'any') {
      Object.values(this.channels).forEach(channel => {
        channel!.forEach((h: IMessageHandler) => {
          if (h.getHandler(message)) {
            h.handle(message);
          }
        });
      });
      return true;
    } else if (this.channels[message.handler]?.length) {
      this.channels[message.handler]!.forEach((h: IMessageHandler) => {
        h.handle(message);
      });

      return true;
    } else {
      if (!message.allowZeroSubscribers) {
        this.logger.error('Can\'t handle message {} because no channels found, available channels {}', message, this.channels)();
      }

      return false;
    }
  }

}
