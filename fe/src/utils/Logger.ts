import {Logger} from '../types';


export default class LoggerFactory {

  logsEnabled: boolean;

  constructor(logsEnabled: boolean) {
    this.logsEnabled = logsEnabled;
  }

  dummy() {

  }

  getSingleLogger(initiator: string, style: string, fn: Function) {
    return (...args1) => {
      if (!this.logsEnabled) {
        return this.dummy;
      }
      let args = Array.prototype.slice.call(args1);
      let parts = args.shift().split('{}');
      let params = [window.console, '%c' + initiator, style];
      for (let i = 0; i < parts.length; i++) {
        params.push(parts[i]);
        if (typeof args[i] !== 'undefined') { // args can be '0'
          params.push(args[i]);
        }
      }
      return Function.prototype.bind.apply(fn, params);
    };
  }

  getLogger(initiator: string, style: string): Logger {
    return {
      warn: this.getSingleLogger(initiator, style, console.warn),
      log: this.getSingleLogger(initiator, style, console.log),
      error: this.getSingleLogger(initiator, style, console.error),
      debug: this.getSingleLogger(initiator, style, console.debug)
    };
  }
}

