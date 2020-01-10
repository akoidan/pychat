import {store} from "@/utils/storeHolder";
import router from "@/utils/router";
import sessionHolder from "@/utils/sessionHolder";
import {api, channelsHandler, globalLogger, storage, webrtcApi, ws} from "@/utils/singletons";
import {CurrentUserInfoModel, EditingMessage, MessageModel, RoomModel} from "@/types/model";
import loggerFactory from "@/utils/loggerFactory";
import {
  ALL_ROOM_ID,
  FACEBOOK_APP_ID,
  GOOGLE_OAUTH_2_CLIENT_ID,
} from "@/utils/consts";
import {StorageData} from "@/types/types";

const logger = loggerFactory.getLoggerColor("utils", "#007a70");

export function logout(errMessage?: string) {
  store.logout();
  if (errMessage) {
    store.growlError(errMessage);
  }
  webrtcApi.closeAllConnections();
  sessionHolder.session = "";
  router.replace("/auth/login");
  ws.stopListening();
  channelsHandler.removeAllSendingMessages();
}

export function getDay(dateObj: Date) {
  const month = dateObj.getUTCMonth() + 1; // Months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${year}/${month}/${day}`;
}

export function bounce(ms: number): (cb: Function) => void {
  let stack: number | null;
  let lastCall: Function;

  return function(cb) {
    lastCall = cb;
    if (!stack) {
      stack = window.setTimeout(() => {
        stack = null;
        lastCall();
      }, ms);
    }
  };
}
export async function initStore() {
  const isNew = await storage.connect();
  if (!isNew) {
    const data: StorageData | null = await storage.getAllTree();
    const {session} = sessionHolder;
    globalLogger.log("restored state from db {}, userId: {}, session {}", data, store.userInfo && store.userInfo.userId, session)();
    if (data) {
      if (!store.userInfo && session) {
        store.init(data.setRooms);
      } else {
        store.roomsArray.forEach((storeRoom: RoomModel) => {
          if (data.setRooms.roomsDict[storeRoom.id]) {
            const dbMessages: {[id: number]: MessageModel} = data.setRooms.roomsDict[storeRoom.id].messages;
            for (const dbMessagesKey in dbMessages) {
              if (!storeRoom.messages[dbMessagesKey]) {
                store.addMessage(dbMessages[dbMessagesKey]);
              }
            }
          }
        });
        globalLogger.debug("Skipping settings state {}", data.setRooms)();
      }
      if (session) {
        globalLogger.debug("Appending sending messages {}", data.sendingMessages)();
        data.sendingMessages.forEach((m: MessageModel) => {
          if (m.content && m.id > 0) {
            channelsHandler.sendEditMessage(m.content, m.roomId, m.id, []);
          } else if (m.content) {
            channelsHandler.sendSendMessage(m.content, m.roomId, [], ws.getMessageId(), m.time);
          } else if (m.id > 0) {
            channelsHandler.sendDeleteMessage(m.id, ws.getMessageId());
          }
        });
      } else {
        globalLogger.debug("No pending messages found")();
      }
    }
  }
}

export function login(session: string) {
  if (!(/\w{32}/).exec(session)) {
    throw session;
  }
  sessionHolder.session = session;
  logger.log("Proceeding to /")();
  router.replace(`/chat/${ALL_ROOM_ID}`);
}

declare const gapi: any;
declare const FB: any;

let googleInited: boolean = false;
let fbInited: boolean = false;

export function extractError(args: unknown |unknown[]| {name: string}) {
  try {
    let value: { name: string; message: string; rawError: string } = args as { name: string; message: string; rawError: string };
    if (typeof args === "string") {
      return args;
    } else if ((<unknown[]>args).length > 1) {
      return Array.prototype.join.call(args, " ");
    } else if ((<unknown[]>args).length === 1) {
      value = (<unknown[]>args)[0] as { name: string; message: string; rawError: string };
    }
    if (value && (value.name || value.message)) {
      return `${value.name}: ${value.message}`;
    } else if (value.rawError) {
      return value.rawError;
    }
    return JSON.stringify(value);
  } catch (e) {
    return `Error during parsing error ${e}, :(`;
  }
}

export function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return raw ? parseInt(raw[2], 10) : false;
}

export async function initGoogle(): Promise<void> {
  if (!googleInited && GOOGLE_OAUTH_2_CLIENT_ID) {
    logger.log("Initializing google sdk")();
    await api.loadGoogle();
    if (typeof gapi.load !== "function") { // TODO
      throw Error(`Gapi doesnt have load function ${JSON.stringify(Object.keys(gapi))}`);
    }
    await new Promise((r) => gapi.load("client:auth2", r));
    logger.log("gapi 2 is ready")();
    await gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID});
    logger.log("gauth 2 is ready")();
    googleInited = true;
  }
}

// Allow only boolean fields be pass to ApplyGrowlErr
type ClassType = new (...args: any[]) => any;
type ValueFilterForKey<T extends InstanceType<ClassType>, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];

// TODO add success growl, and specify error property so it reflects forever in comp
export function ApplyGrowlErr<T extends InstanceType<ClassType>>({message, runningProp, vueProperty}: {
  message?: string;
  runningProp?: ValueFilterForKey<T, boolean>;
  vueProperty?: ValueFilterForKey<T, string>;
}) {
  const processError = function(e: Error|string) {
    const strError: string = String((<Error>e).message || e);
    if (vueProperty && message) {
      // @ts-ignore: next-line
      this[vueProperty] = `${message}: ${strError}`;
    } else if (message) {
      store.growlError(`${message}:  ${strError}`);
    } else if (vueProperty) {
      // @ts-ignore: next-line
      this[vueProperty] = `Error: ${strError}`;
    } else {
      throw e;
    }
  };

  return function(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args: unknown[]) {
      // @ts-ignore: next-line
      if (this[runningProp]) {
        // @ts-ignore: next-line
        this.logger.warn("Skipping {} as it's loading", descriptor.value)();
        return;
      }
      try {
        if (runningProp) {
          // @ts-ignore: next-line
          this[runningProp] = true;
        }
        const a = await original.apply(this, args);
        if (vueProperty) {
          // @ts-ignore: next-line
          this[vueProperty] = "";
        }

        return a;
      } catch (e) {
        processError.call(this, e);
      } finally {
        if (runningProp) {
          // @ts-ignore: next-line
          this[runningProp] = false;
        }
      }
    };
  };
}

export async function initFaceBook() {
  if (!fbInited && FACEBOOK_APP_ID) {
    await api.loadFacebook();
    logger.log("Initing facebook sdk...")();
    FB.init({
      appId: FACEBOOK_APP_ID,
      xfbml: true,
      version: "v2.7",
    });
    fbInited = true;
  }
}

export function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes < 1) {
    return "0 Byte";
  }
  const power: number = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${Math.round(bytes / 1024 ** power)} ${sizes[power]}`;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export function sem(event: Event, message: MessageModel, isEditingNow: boolean, userInfo: CurrentUserInfoModel, setEditedMessage: (a: EditingMessage) => void) {
  logger.debug("sem {}", message.id)();
  if (event.target &&
      (<HTMLElement>event.target).tagName !== "IMG" &&
      message.userId === userInfo.userId &&
      !message.deleted &&
      message.time + ONE_DAY > Date.now()
  ) {
    event.preventDefault();
    event.stopPropagation();
    const newlet: EditingMessage = {
      messageId: message.id,
      isEditingNow,
      roomId: message.roomId,
    };
    setEditedMessage(newlet);
  }
}
