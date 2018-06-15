import {Logger} from './Logger';
import {ChatHandlerMessage, DefaultMessage, MessageHandler} from '../types';
import loggerFactory from './loggerFactory';
import ChatHandler from './ChatHandler';

export default class ChannelsHandler implements MessageHandler {
  private logger: Logger;
  private dbMessages: Array<any>;
  private chatHandlers: { [id: number]: ChatHandler };

  constructor() {
    this.logger = loggerFactory.getLogger('CHAT', 'color: #FF0F00; font-weight: bold');
  }

  handle(message: DefaultMessage) {
    if (message.handler === 'channels') {
      this[`handle${message.action}`](message);
    } else if (message.handler === 'chat') {
      let chm: ChatHandlerMessage = message as ChatHandlerMessage;
      let channelHandler: ChatHandler = this.chatHandlers[chm.roomId];
      if (channelHandler) {
        channelHandler.handle(chm);
      } else {
        throw `Unknown channel ${chm.roomId} for message "${JSON.stringify(message)}"`;
      }
    }
  }

}
