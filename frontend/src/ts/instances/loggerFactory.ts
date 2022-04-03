import type {LogLevel} from "lines-logger";
import {LoggerFactory} from "lines-logger";
import {
  IS_DEBUG,
  LOG_LEVEL_LS,
} from "@/ts/utils/consts";

export default new LoggerFactory(localStorage.getItem(LOG_LEVEL_LS) as LogLevel || (IS_DEBUG ? "trace" : "error"));
