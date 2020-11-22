import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';
import {
  DefaultInMessage,
  HandlerName,
  IMessageHandler
} from '@/ts/types/messages/baseMessagesInterfaces';
import { DefaultInnerSystemMessage } from '@/ts/types/messages/innerMessages';

export default class Subscription {
  // TODO sub should unsubscribe from some events on logout

  public channels: Partial<Record<HandlerName, IMessageHandler[]>> = {};
  private readonly logger: Logger;

  constructor() {
    this.logger = loggerFactory.getLogger('sub');
  }

  public static getPeerConnectionId(connectionId: string, opponentWsId: string): 'peerConnection:*' {
    return `peerConnection:${connectionId}:${opponentWsId}` as 'peerConnection:*';
  }

  public static allPeerConnectionsForTransfer(connectionId: string): 'peerConnection:*' {
    return `peerConnection:${connectionId}:ALL_OPPONENTS` as 'peerConnection:*';
  }

  public static getTransferId(connectionId: string): 'webrtcTransfer:*' {
    return `webrtcTransfer:${connectionId}` as 'webrtcTransfer:*';
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

  public notify<T extends DefaultInMessage<string, HandlerName>>(message: T): boolean {
    this.logger.debug('notifing {}', message)();
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
      if (!(message as DefaultInnerSystemMessage<string, HandlerName>).allowZeroSubscribers) {
        this.logger.error('Can\'t handle message {} because no channels found, available channels {}', message, this.channels)();
      }

      return false;
    }
  }

}
