import type {
  FileModel,
  MessageModel,
} from "@/ts/types/model";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {MessageSender} from "@/ts/types/types";
import {ALLOW_EDIT_MESSAGE_IF_UPDATE_HAPPENED_MS_AGO} from "@/ts/utils/consts";

export function bytesToSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes < 1) {
    return "0 Byte";
  }
  const power: number = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${Math.round(bytes / 1024 ** power)} ${sizes[power]}`;
}

export function hexEncode(v: string) {
  let hex, i;
  let result = "";
  for (i = 0; i < v.length; i++) {
    hex = v.charCodeAt(i).toString(16);
    result += `\\u${`000${hex}`.slice(-4)}`;
  }
  return result;
}

export function getChromeVersion() {
  const raw = (/Chrom(e|ium)\/([0-9]+)\./).exec(navigator.userAgent);

  return raw ? parseInt(raw[2], 10) : false;
}

export function getStreamLog(m: MediaStream | null): MediaStream | string | null {
  if (!m) {
    return null;
  }
  if (!m.id) {
    return m;
  }
  return `sream:${m.id};${m.active ? "active" : "inactive"};audio=${m.getAudioTracks().length};video=${m.getVideoTracks().length}`;
}

export function getTrackLog(m: MediaStreamTrack | null): MediaStreamTrack | string | null {
  if (!m) {
    return null;
  }
  if (!m.id) {
    return m;
  }
  return `track:${m.id};${(m as any).active ? "active" : "inactive"}`;
}

export function extractError(args: unknown[] | unknown | {name: string}) {
  try {
    let value: {name: string; message: string; rawError: string} = args as {name: string; message: string; rawError: string};
    if (typeof args === "string") {
      return args;
    } else if ((<unknown[]>args).length > 1) {
      return Array.prototype.join.call(args, " ");
    } else if ((<unknown[]>args).length === 1) {
      value = (<unknown[]>args)[0] as {name: string; message: string; rawError: string};
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

export function getMissingIds(roomId: number, store: DefaultStore): number[] {
  const {messages} = store.roomsDict[roomId];
  return Object.values(messages).filter((m) => m.parentMessage && !messages[m.parentMessage]).
    map((m) => m.parentMessage!);
}

export function checkIfIdIsMissing(message: MessageModel, store: DefaultStore): boolean {
  return Boolean(message.parentMessage) && !store.roomsDict[message.roomId].messages[message.parentMessage!];
}

export function showAllowEditing(message: MessageModel) {

  /*
   * Do nto allow edit message longer than 1 day, because it will appear on other history, which would be weird
   * in the history of last week a message edited 1 year ago would be always on top
   */
  return Date.now() - message.time < ALLOW_EDIT_MESSAGE_IF_UPDATE_HAPPENED_MS_AGO || message.id < 0;
}

export function editMessageWs(
  messageContent: string | null,
  messageId: number,
  roomId: number,
  symbol: string | null,
  files: Record<number, FileModel> | null,
  tags: Record<string, number>,
  time: number,
  edited: number,
  parentMessage: number | null,
  store: DefaultStore,
  ms: MessageSender,
): void {
  const shouldBeSynced: boolean = messageId > 0 || Boolean(messageContent);
  const oldMessage = store.roomsDict[roomId].messages[messageId];
  const mm: MessageModel = {
    roomId,
    deleted: !messageContent,
    id: messageId,
    isHighlighted: oldMessage ? oldMessage.isHighlighted : false,
    transfer: Boolean(messageContent) || messageId > 0 ? { // TODO can this be simplified?
      error: null,
      upload: null,
      xhr: null,
    } : null,
    time,
    tags,
    threadMessagesCount: oldMessage ? oldMessage.threadMessagesCount : 0,
    isEditingActive: oldMessage ? oldMessage.isEditingActive : false,
    isThreadOpened: oldMessage ? oldMessage.isThreadOpened : false,
    parentMessage,
    status: shouldBeSynced ? "sending" : "on_server",
    content: messageContent,
    symbol,
    edited,
    files,
    userId: store.userInfo?.userId!,
  };
  store.addMessage(mm);
  if (shouldBeSynced) { // Message hasn't been sync to server and was deleted localy
    ms.syncMessage(roomId, messageId);
  }
}

export function buildQueryParams(params: Record<string, number | string>) {
  return Object.keys(params).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).
    join("&");
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

export function getDay(dateObj: Date) {
  const month = dateObj.getUTCMonth() + 1; // Months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  return `${year}/${month}/${day}`;
}
