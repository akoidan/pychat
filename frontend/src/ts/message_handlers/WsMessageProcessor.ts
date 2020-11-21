import AbstractMessageProcessor from '@/ts/message_handlers/AbstractMessageProcessor';
import {
  DefaultWsInMessage,
  GrowlMessage
} from '@/ts/types/messages/wsInMessages';
import { HandlerName } from '@/ts/types/messages/baseMessagesInterfaces';
import { sub } from '@/ts/instances/subInstance';
import { DefaultWsOutMessage } from '@/ts/types/messages/wsOutMessages';

export class WsMessageProcessor extends AbstractMessageProcessor {

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

}