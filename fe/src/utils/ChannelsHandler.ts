import {Logger} from './Logger';

export default class ChannelsHandler {
  private logger: Logger;
  private dbMessages: Array<any>;


  constructor(logger: Logger) {
    this.logger =  logger;
  }

}
