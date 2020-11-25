import AbstractMessageProcessor from '@/ts/message_handlers/AbstractMessageProcessor';
import {
  DefaultWsInMessage,
  GrowlMessage
} from '@/ts/types/messages/wsInMessages';
import { HandlerName } from '@/ts/types/messages/baseMessagesInterfaces';
import { sub } from '@/ts/instances/subInstance';
import { DefaultP2pMessage } from '@/ts/types/messages/p2pMessages';

export class P2PMessageProcessor extends AbstractMessageProcessor {

  public resolveCBifItsThere(data: DefaultP2pMessage<string>): boolean{
    this.logger.debug('resolving cb')();
    if (data.resolveCbId) {
      this.callBacks[data.resolveCbId].resolve(data);
      delete this.callBacks[data.resolveCbId];
      return true;
    } else {
      return false;
    }

  }

}