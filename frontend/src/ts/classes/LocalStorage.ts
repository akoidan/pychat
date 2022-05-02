import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeStreamMessage} from "@/ts/types/messages/inner/change.stream";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {CheckTransferDestroyMessage} from "@/ts/types/messages/inner/check.transfer.destroy";
import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import {DestroyPeerConnectionMessage} from "@/ts/types/messages/inner/destroy.peer.connection";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {LoginMessage} from "@/ts/types/messages/inner/login";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";
import {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {SyncP2PMessage} from "@/ts/types/messages/inner/sync.p2p";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {
  IStorage,
  SetFileIdsForMessage,
  SetRoomsUsers,
} from "@/ts/types/types";
import type {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  MessageModel,
  RoomSettingsModel,
  UserModel,
} from "@/ts/types/model";
import {MessageStatusModel} from '@/ts/types/model';
import type {Logger} from "lines-logger";

interface LocalStorageMessage {
  f: number;
  h: number;
}

export default class LocalStorage implements IStorage {
  private readonly logger: Logger;

  private readonly STORAGE_NAME = "wsHeaderIds";

  private cache: Record<number, LocalStorageMessage> = {};

  public constructor() {
    this.logger = loggerFactory.getLogger("localStor");
    const ms = localStorage.getItem(this.STORAGE_NAME);
    if (ms) {
      const loaded = JSON.parse(ms);
      for (const k in loaded) {
        this.cache[parseInt(k)] = {
          h: loaded[k],
          f: loaded[k],
        };
      }
    } else {
      localStorage.setItem(this.STORAGE_NAME, "{}");
    }
  }

  /*
   * Public getIds(cb: SingleParamCB<object>) {
   *   cb(this.cache);
   * }
   */

  public saveMessage(message: MessageModel) {
    this.setRoomHeaderId(message.roomId, message.id);
  }

  public saveMessages(messages: MessageModel[]) {
    messages.forEach((message) => {
      this.applyCache(message.roomId, message.id);
    });
    const lm = JSON.parse(localStorage.getItem(this.STORAGE_NAME) || "{}");
    for (const k in this.cache) {
      if (!lm[k] || this.cache[k].h < lm[k]) {
        lm[k] = this.cache[k].h;
      }
    }
    localStorage.setItem(this.STORAGE_NAME, JSON.stringify(lm));
  }

  public updateFileIds(m: SetFileIdsForMessage) {
  }

  public deleteMessage(id: number, replaceThreadId: number) {
  }

  public setThreadMessageCount(mesageid: number, count: number): void {
  }

  public deleteRoom(id: number) {
  }

  public deleteChannel(id: number) {
  }

  public updateRoom(m: RoomSettingsModel) {
  }

  public setRooms(rooms: RoomSettingsModel[]) {
  }

  public setChannels(channels: ChannelModel[]) {
  }

  public saveRoom(room: RoomSettingsModel) {
  }

  public saveChannel(room: ChannelModel) {
  }

  public setUserProfile(user: CurrentUserInfoModel) {
  }

  public setUserSettings(settings: CurrentUserSettingsModel) {
  }

  public saveRoomUsers(ru: SetRoomsUsers) {
  }

  public setUsers(users: UserModel[]) {
  }

  public setMessagesStatus(messagesIds: number[], status: MessageStatusModel) {
  }

  public saveUser(users: UserModel) {
  }

  public markMessageAsSent(m: number[]) {
  }

  public clearMessages() {
    this.clearStorage();
  }

  public clearStorage() {
    localStorage.setItem(this.STORAGE_NAME, "{}");
    this.cache = {};
  }

  public setRoomHeaderId(roomId: number, value: number) {
    if (!this.applyCache(roomId, value)) {
      this.saveJson(roomId, value);
    }
  }

  public async connect(): Promise<null> {
    return null;
  }

  /*
   * Public getRoomHeaderId(roomId: number, cb: SingleParamCB<number>) {
   *   cb(this.cache[roomId] ? this.cache[roomId].h : null);
   * }
   */

  private applyCache(roomId: number, value: number): boolean {
    if (!this.cache[roomId]) {
      this.cache[roomId] = {
        h: value,
        f: value,
      };
    } else if (value < this.cache[roomId].h) {
      this.cache[roomId].h = value;
    } else if (value > this.cache[roomId].f) {
      this.cache[roomId].f = value;
    } else {
      return true;
    }

    return false;
  }

  private saveJson(roomId: number, value: number) {
    const lm = JSON.parse(localStorage.getItem(this.STORAGE_NAME) || "{}");
    if (!lm[roomId] || value < lm[roomId]) {
      lm[roomId] = value;
      this.logger.debug("Updating headerId {} -> {} for room {}. LS: {}", lm[roomId], value, roomId, lm)();
      localStorage.setItem(this.STORAGE_NAME, JSON.stringify(lm));
    } else {
      this.logger.debug("Loaded header ids for room {} from local storage {} . Update is not needed since stored header {} is lower than current ", roomId, lm, lm[roomId], value)();
    }
  }
}
