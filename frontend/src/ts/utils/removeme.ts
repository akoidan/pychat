/* eslint-disable */

// TODO remove logger
type DoLog = (format: string, ...args: unknown[]) => () => void;

export interface Logger {
  warn: DoLog;
  log: DoLog;
  error: DoLog;
  debug: DoLog;
  trace: DoLog;
}

const logLevels: Record<LogLevel, number> = {
  log_raise_error: 1,
  log_with_warnings: 2,
  trace: 3,
  debug: 4,
  info: 5,
  warn: 6,
  error: 7,
  disable: 8,
};

interface MockConsole {
  trace(message?: unknown, ...optionalParams: unknown[]): void;

  debug(message?: unknown, ...optionalParams: unknown[]): void;

  log(message?: unknown, ...optionalParams: unknown[]): void;

  warn(message?: unknown, ...optionalParams: unknown[]): void;

  error(message?: unknown, ...optionalParams: unknown[]): void;
}

type LogLevel =
  "debug"
  | "disable"
  | "error"
  | "info"
  | "log_raise_error"
  | "log_with_warnings"
  | "trace"
  | "warn";

export class LoggerFactory {
  private logLevel: LogLevel;

  private readonly mockConsole: MockConsole;

  constructor(
    logLevel: LogLevel = "log_with_warnings",
    mockConsole: MockConsole | null = null,
  ) {
    this.logLevel = logLevel;
    if (!logLevels[logLevel]) {
      throw Error(`Invalid log level ${logLevel} allowed: ${
        JSON.stringify(logLevels)}`);
    }
    if (mockConsole) {
      this.mockConsole = mockConsole;
    } else {
      this.mockConsole = console;
    }
  }

  static getHash(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let ch, i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  setLogWarnings(logWarnings: LogLevel): void {
    this.logLevel = logWarnings;
  }

  getLogWarnings(): LogLevel {
    return this.logLevel;
  }

  /**
   * @return Single log function that can be called, e.g.
   * getSingleLogger(...)('hello wolrd')
   * @param name - badge string, that every log will be marked with
   * @param color - css color of badge, e.g. #FFFAAA
   * @param fn - binded function that will be called eventually, e.g.
   * console.log
   */
  getSingleLoggerColor(name: string, color: string, fn: Function): DoLog {
    return this.getSingleLoggerStyle(name, this.getColorStyle(color), fn);
  }

  /**
   * @return Single log function that can be called, e.g.
   * getSingleLogger(...)('hello wolrd')
   * @param name - badge string, that every log will be marked with
   * @param fn - binded function that will be called eventually, e.g.
   * console.log
   */
  getSingleLogger(name: string, fn: Function): DoLog {
    const color = this.getRandomColor(name);
    return this.getSingleLoggerStyle(name, this.getColorStyle(color), fn);
  }

  getSingleLoggerStyle(
    name: string, style: string, fn: Function,
    minLevel: LogLevel = "log_with_warnings",
  ): DoLog {
    return (...args1: unknown[]) => {
      if (logLevels[this.logLevel] > logLevels[minLevel]) {
        return this.dummy;
      }
      const args = Array.prototype.slice.call(args1);
      const parts = args.shift().split("{}");

      // TODO
      const params: any[any] = [this.mockConsole, `%c${name}`, style];

      for (let i = 0; i < parts.length; i++) {
        params.push(parts[i]);
        if (typeof args[i] !== "undefined") { // Args can be '0'
          params.push(args[i]);
        }
      }
      if (parts.length - 1 !== args.length) {
        if (this.logLevel === "log_with_warnings") {
          this.mockConsole.error("MissMatch amount of arguments");
        } else if (this.logLevel === "log_raise_error") {
          throw new Error("MissMatch amount of arguments");
        }
      }
      return Function.prototype.bind.apply(fn, params);
    };
  }

  getLoggerColor(name: string, color: string): Logger {
    return this.getLoggerStyle(name, this.getColorStyle(color));
  }

  getColorStyle(color: string): string {
    return `color: white; background-color: ${
      color}; padding: 2px 6px; border-radius: 2px; font-size: 10px`;
  }

  getRandomColor(str: string = "") {
    const hash = LoggerFactory.getHash(str);
    let color = "#";
    for (let i = 0; i < 3; i++) {
      // Get 7 bits in range, and cast them to hex, so we have 0..127 of rgb in hex for each color
      color += `00${((hash >> i * 7 & 0b1111111) + 8).toString(16)}`.substr(-2);
    }
    return color;
  }

  getLogger(name: string) {
    return this.getLoggerColor(name, this.getRandomColor(name));
  }

  getLoggerStyle(name: string, style: string): Logger {
    return {
      trace: this.getSingleLoggerStyle(name, style, this.mockConsole.trace, "trace"),
      debug: this.getSingleLoggerStyle(name, style, this.mockConsole.debug, "debug"),
      log: this.getSingleLoggerStyle(name, style, this.mockConsole.log, "info"),
      warn: this.getSingleLoggerStyle(name, style, this.mockConsole.warn, "warn"),
      error: this.getSingleLoggerStyle(name, style, this.mockConsole.error, "error"),
    };
  }

  private dummy() {
  }
}
