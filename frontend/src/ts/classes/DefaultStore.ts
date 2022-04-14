import Vuex from "vuex";

import loggerFactory from "@/ts/instances/loggerFactory";
import type {
  ChannelsDictModel,
  ChannelsDictUIModel,
  ChannelUIModel,
  CurrentUserInfoModel,
  IncomingCallModel,
  Location,
  MessageStatusModel,
  PastingTextAreaElement,
  RoomDictModel,
  SendingFileTransfer,
  UserDictModel,
} from "@/ts/types/model";
import {
  ChannelModel,
  CurrentUserInfoWoImage,
  CurrentUserSettingsModel,
  EditingMessage,
  GrowlModel,
  GrowlType,
  MessageModel,
  MessageStatusInner,
  ReceivingFile,
  RoomModel,
  RoomSettingsModel,
  SendingFile,
  UserModel,
} from "@/ts/types/model";
import type {PrivateRoomsIds} from "@/ts/types/types";
import {
  AddMessagesDTO,
  AddSendingFileTransfer,
  BooleanIdentifier,
  IStorage,
  LiveConnectionLocation,
  MarkMessageAsRead,
  MediaIdentifier,
  MessagesLocation,
  NumberIdentifier,
  RemoveMessageProgress,
  RoomLogEntry,
  RoomMessageIds,
  RoomMessagesIds,
  SetCallOpponent,
  SetDevices,
  SetFileIdsForMessage,
  SetMessageProgress,
  SetMessageProgressError,
  SetOpponentAnchor,
  SetOpponentVoice,
  SetReceivingFileStatus,
  SetReceivingFileUploaded,
  SetRoomsUsers,
  SetSearchStateTo,
  SetSearchTextTo,
  SetSendingFileStatus,
  SetSendingFileUploaded,
  SetUploadProgress,
  SetUploadXHR,
  ShareIdentifier,
  StringIdentifier,
} from "@/ts/types/types";
import {
  MessageStatus,
  SetStateFromStorage,
  SetStateFromWS,
} from "@/ts/types/dto";
import {encodeHTML} from "@/ts/utils/htmlApi";
import {
  ACTIVE_ROOM_ID_LS_NAME,
  ALL_ROOM_ID,
  SHOW_I_TYPING_INTERVAL,
} from "@/ts/utils/consts";
import {
  Action,
  Module,
  Mutation,
  VuexModule,
} from "vuex-module-decorators";
import {Gender} from '@/ts/types/backend';

const logger = loggerFactory.getLogger("store");


async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mediaLinkIdGetter: Function = (function() {
  let i = 0;

  return function() {
    return String(i++);
  };
}());

export const vueStore = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
});

function Validate(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: unknown[]) {
    try {
      original.apply(this, args);
    } catch (e) {
      logger.warn(`Invalid temporal store structure.${propertyKey} {} {}`, args, JSON.parse(JSON.stringify(this)))();
    }
  };
}

const SHOW_I_TYPING_INTERVAL_SHOW = SHOW_I_TYPING_INTERVAL * 1.5;

@Module({
  dynamic: true,
  namespaced: true,
  name: "default",
  store: vueStore,
})
export class DefaultStore extends VuexModule {
  public storage!: IStorage; // We proxy this as soon as we created Storage

  public isOnline: boolean = false;

  public growls: GrowlModel[] = [];

  public pastingTextAreaQueue: PastingTextAreaElement[] = [];

  public incomingCall: IncomingCallModel | null = null;

  public smileysLoaded: boolean = false;

  public microphones: Record<string, string> = {};

  public speakers: Record<string, string> = {};

  public webcams: Record<string, string> = {};

  public activeRoomId: number | null = ALL_ROOM_ID;

  public userInfo: CurrentUserInfoModel | null = null;

  public userSettings: CurrentUserSettingsModel | null = null;

  public allUsersDict: UserDictModel = {};

  public regHeader: string | null = null;

  public onlineDict: Record<string, string[]> = {};

  public roomsDict: RoomDictModel = {};

  public channelsDict: ChannelsDictModel = {};

  public mediaObjects: Record<string, MediaStream> = {};

  public isCurrentWindowActive: boolean = true;

  public currentChatPage: "chat" | "rooms" = "chat";

  public get getStorage() { // Not reactive state is not available outside
    return this.storage;
  }

  get userName(): (id: number) => string {
    return (id: number): string => this.allUsersDict[id].username;
  }

  get privateRooms(): RoomModel[] {
    const roomModels: RoomModel[] = this.roomsArray.filter((r) => !r.name && !r.channelId);
    logger.debug("privateRooms {} ", roomModels)();

    return roomModels;
  }

  get online(): number[] {
    return Object.keys(this.onlineDict).map((a) => parseInt(a, 10));
  }

  get calculatedMessagesForRoom(): (roomId: number) => any[] {
    return (roomId: number): any[] => {
      const room = this.roomsDict[roomId];
      let {roomLog} = room;
      if (!this.userSettings?.onlineChangeSound) {
        roomLog = roomLog.filter((l) => l.action !== "appeared online" && l.action !== "gone offline");
      }
      const newArray: any[] = roomLog.map((value) => ({
        isUserAction: true,
        ...value,
      }));
      newArray.push(...room.changeName.map((value) => ({
        isChangeName: true,
        ...value,
      })));
      const dates: Record<string, boolean> = {};
      const messageDict: Record<number, {parent?: MessageModel; messages: (MessageModel | ReceivingFile | SendingFile)[]}> = {};
      for (const m in room.messages) {
        const message = room.messages[m];
        if (message.parentMessage) {
          if (!messageDict[message.parentMessage]) {
            messageDict[message.parentMessage] = {messages: []};
          }
          messageDict[message.parentMessage].messages.push(message);
        } else {
          if (!messageDict[message.id]) {
            messageDict[message.id] = {messages: []};
          }
          messageDict[message.id].parent = message;
          const d = new Date(message.time).toDateString();
          if (!dates[d]) {
            dates[d] = true;
            newArray.push({
              fieldDay: d,
              time: Date.parse(d),
            });
          }
        }
      }
      for (const m in room.sendingFiles) {
        const sendingFile: SendingFile = room.sendingFiles[m];
        if (sendingFile.threadId) {
          if (messageDict[sendingFile.threadId]) {
            messageDict[sendingFile.threadId].messages.push(sendingFile);
          } else {
            logger.warn(`Receiving file {} won't be dispayed as thread ${sendingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(sendingFile);
        }
      }
      for (const m in room.receivingFiles) {
        const receivingFile: ReceivingFile = room.receivingFiles[m];
        if (receivingFile.threadId) {
          if (messageDict[receivingFile.threadId]) {
            messageDict[receivingFile.threadId].messages.push(receivingFile);
          } else {
            logger.warn(`Receiving file {} won't be displayed as thread ${receivingFile.threadId} is not loaded yet`)();
          }
        } else {
          newArray.push(receivingFile);
        }
      }
      Object.values(messageDict).forEach((v) => {
        if (v.messages.length || v.parent?.isThreadOpened || v.parent && v.parent.threadMessagesCount > 0) {
          if (v.parent) {
            v.messages.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
            newArray.push({
              parent: v.parent,
              thread: true,
              messages: v.messages,
              time: v.parent.time,
            });
          } else {
            logger.warn(`Skipping rendering messages ${v.messages.map((m) => (m as MessageModel).id)} as parent is not loaded yet`)();
          }
        } else {
          newArray.push(v.parent);
        }
      });
      newArray.sort((a, b) => a.time > b.time ? 1 : a.time < b.time ? -1 : 0);
      logger.debug("Reevaluating messages in room #{}: {}", room.id, newArray)();
      return newArray;
    };
  }

  get channelsDictUI(): ChannelsDictUIModel {
    const result: ChannelsDictUIModel = this.roomsArray.reduce<ChannelsDictUIModel>((dict, current: RoomModel) => {
      const {channelId} = current;
      if (channelId) {
        if (!dict[channelId]) {
          const channel = this.channelsDict[channelId];
          if (!channel) {
            throw Error(`Unknown channel ${channelId}`);
          }
          dict[channelId] = {
            id: channel.id,
            expanded: channel.expanded,
            rooms: [],
            mainRoom: null!,
            name: channel.name,
            creatorId: channel.creatorId,
          };
        }
        if (current.isMainInChannel) {
          dict[channelId].mainRoom = current; // TODO throw error on invalid structure
        } else {
          dict[channelId].rooms.push(current);
        }
      }
      return dict;
    }, {});

    const allChannels: ChannelsDictUIModel = Object.keys(this.channelsDict).filter((k) => !result[k]).
      reduce((previousValue, currentValue) => {
        previousValue[currentValue] = {
          ...this.channelsDict[currentValue],
          rooms: [],
          mainRoom: null!,
        };
        return previousValue;
      }, result);

    logger.debug("Channels dict {} ", allChannels)();

    return allChannels;
  }

  get channels(): ChannelUIModel[] {
    return Object.values(this.channelsDictUI);
  }

  get myId(): number | null {
    return this.userInfo?.id ?? null;
  }

  get privateRoomsUsersIds(): PrivateRoomsIds {
    const roomUsers: Record<number, number> = {};
    const userRooms: Record<number, number> = {};
    if (this.userInfo) {
      const {myId} = this;
      this.privateRooms.forEach((r: RoomModel) => {
        const anotherUId = myId === r.users[0] && r.users.length === 2 ? r.users[1] : r.users[0];
        roomUsers[r.id] = anotherUId;
        userRooms[anotherUId] = r.id;
      });
    }

    return {
      roomUsers,
      userRooms,
    };
  }

  get roomsArray(): RoomModel[] {
    const anies = Object.values(this.roomsDict);
    logger.debug("roomsArray {}", anies)();

    return anies;
  }

  get usersArray(): UserModel[] {
    const res: UserModel[] = Object.values(this.allUsersDict);
    logger.debug("usersArray {}", res)();

    return res;
  }

  get activeRoom(): RoomModel | null {
    if (this.activeRoomId && this.roomsDict) {
      return this.roomsDict[this.activeRoomId];
    }
    return null;
  }

  get activeRoomOnline(): string[] {
    const online: string[] = [];
    if (this.activeRoom) {
      this.activeRoom.users.forEach((u) => {
        if (this.onlineDict[u]) {
          online.push(...this.onlineDict[u]);
        }
      });
    }
    return online;
  }

  @Mutation
  public setMessageProgress(payload: SetMessageProgress) {
    const {transfer} = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (transfer && transfer.upload) {
      transfer.upload.uploaded = payload.uploaded;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }
  }

  @Mutation
  public setCurrentChatPage(currentChatPage: "chat" | "rooms") {
    this.currentChatPage = currentChatPage;
  }

  @Mutation
  public markMessageAsRead(payload: MarkMessageAsRead) {
    this.roomsDict[payload.roomId].messages[payload.messageId].isHighlighted = false;
  }

  @Mutation
  public setStorage(payload: IStorage) {
    this.storage = payload;
  }

  @Mutation
  public finishLoadingSmileys() {
    this.smileysLoaded = true;
  }

  @Mutation
  public setUploadXHR(payload: SetUploadXHR) {
    const message = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (message.transfer) {
      message.transfer.xhr = payload.xhr;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }
  }

  @Mutation
  public setUploadProgress(payload: SetUploadProgress) {
    const message = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (message.transfer) {
      message.transfer.upload = payload.upload;
    } else {
      throw Error(`Transfer upload doesn't exist ${JSON.stringify(this.state)} ${JSON.stringify(payload)}`);
    }
  }

  @Mutation
  public setIncomingCall(payload: IncomingCallModel | null) {
    this.incomingCall = payload;
  }

  @Mutation
  @Validate
  public setCallOpponent(payload: SetCallOpponent) {
    if (payload.callInfoModel) {
      // Vue.set
      this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId] = payload.callInfoModel;
    } else {
      // Vue.delete
      delete this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId];
    }
  }

  @Mutation
  @Validate
  public setOpponentVoice(payload: SetOpponentVoice) {
    this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].opponentCurrentVoice = payload.voice;
  }

  @Mutation
  public setOpponentAnchor(payload: SetOpponentAnchor) {
    let key = null;
    for (const k in this.mediaObjects) {
      if (this.mediaObjects[k] === payload.anchor) {
        key = k;
      }
    }
    if (!key) {
      // TODO do we need to fire watch if track added but stream hasn't changed?
      const key = mediaLinkIdGetter();
      this.roomsDict[payload.roomId].callInfo.calls[payload.opponentWsId].mediaStreamLink = key;
      // Vue.set
      this.mediaObjects[key] = payload.anchor;
    }
  }

  @Mutation
  public addSendingFile(payload: SendingFile) {
    // Vue.set
    this.roomsDict[payload.roomId].sendingFiles[payload.connId] = payload;
  }

  @Mutation
  public expandChannel(channelid: number) {
    this.channelsDict[channelid].expanded = !this.channelsDict[channelid].expanded;
  }

  @Mutation
  public setCurrentMicLevel(payload: NumberIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMicLevel = payload.state;
  }

  @Mutation
  public setCurrentMic(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentMic = payload.state;
  }

  @Mutation
  public setIsCurrentWindowActive(payload: boolean) {
    this.isCurrentWindowActive = payload;
  }

  @Mutation
  public setCurrentSpeaker(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentSpeaker = payload.state;
  }

  @Mutation
  public setCurrentWebcam(payload: StringIdentifier) {
    this.roomsDict[payload.id].callInfo.currentWebcam = payload.state;
  }

  @Mutation
  public setMicToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.showMic = payload.state;
  }

  @Mutation
  public setVideoToState(payload: ShareIdentifier) {
    const ci = this.roomsDict[payload.id].callInfo;
    ci.shareScreen = false;
    ci.sharePaint = false;
    ci.showVideo = false;
    if (payload.type === "desktop") {
      ci.shareScreen = payload.state;
    } else if (payload.type === "webcam") {
      ci.showVideo = payload.state;
    } else if (payload.type === "paint") {
      ci.sharePaint = payload.state;
    }
  }

  @Mutation
  public setDevices(payload: SetDevices) {
    this.microphones = payload.microphones;
    this.webcams = payload.webcams;
    this.speakers = payload.speakers;
    if (this.roomsDict[payload.roomId].callInfo) {
      if (Object.keys(payload.microphones).length === 0) {
        this.roomsDict[payload.roomId].callInfo.showMic = false;
      }
      if (Object.keys(payload.webcams).length === 0) {
        this.roomsDict[payload.roomId].callInfo.showVideo = false;
      }
    }
  }

  @Mutation
  public setCallActiveToState(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callActive = payload.state;
  }

  @Mutation
  @Validate
  public setLocalStreamSrc(payload: MediaIdentifier) {
    const key: string = mediaLinkIdGetter();
    // Vue.set
    this.mediaObjects[key] = payload.media!;
    this.roomsDict[payload.id].callInfo.mediaStreamLink = key;
  }

  @Mutation
  public addReceivingFile(payload: ReceivingFile) {
    // Vue.set
    this.roomsDict[payload.roomId].receivingFiles[payload.connId] = payload;
  }

  @Mutation
  @Validate
  public addSendingFileTransfer(payload: AddSendingFileTransfer) {
    // Vue.set
    this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transferId] = payload.transfer;
  }

  @Mutation
  public setReceivingFileStatus(payload: SetReceivingFileStatus) {
    const receivingFile: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    receivingFile.status = payload.status;
    if (payload.error !== undefined) {
      receivingFile.error = payload.error;
    }
    if (payload.anchor !== undefined) {
      receivingFile.anchor = payload.anchor;
    }
  }

  @Mutation
  @Validate
  public setSendingFileStatus(payload: SetSendingFileStatus) {
    const transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    transfer.status = payload.status;
    if (payload.error !== undefined) {
      transfer.error = payload.error;
    }
  }

  @Mutation
  public setSendingFileUploaded(payload: SetSendingFileUploaded) {
    const transfer: SendingFileTransfer = this.roomsDict[payload.roomId].sendingFiles[payload.connId].transfers[payload.transfer];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  public setReceivingFileUploaded(payload: SetReceivingFileUploaded) {
    const transfer: ReceivingFile = this.roomsDict[payload.roomId].receivingFiles[payload.connId];
    transfer.upload.uploaded = payload.uploaded;
  }

  @Mutation
  public setMessagesStatus(
    {
      roomId,
      messagesIds,
      status,
    }: {
      roomId: number;
      messagesIds: number[];
      status: MessageStatusModel;
    },
  ) {
    const ids = Object.values(this.roomsDict[roomId].messages).filter((m) => messagesIds.includes(m.id)).
      map((m) => {
        m.status = status;
        return m.id;
      });
    if (ids.length) {
      this.storage.setMessagesStatus(ids, status);
    }
  }

  /*
   * ResetNewMessagesCount(roomId: number) {
   *   this.roomsDict[roomId].newMessagesCount = 0;
   * }
   */

  @Mutation
  public removeMessageProgress(payload: RemoveMessageProgress) {
    const message: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    message.transfer!.upload = null;
  }

  @Mutation
  public setMessageProgressError(payload: SetMessageProgressError) {
    const mm: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    mm.transfer!.error = payload.error;
  }

  @Mutation
  public setMessageFileIds(payload: SetFileIdsForMessage) {
    const mm: MessageModel = this.roomsDict[payload.roomId].messages[payload.messageId];
    if (!mm.files) {
      throw Error(`Message ${payload.messageId} in room ${payload.roomId} doesn't have files`);
    }
    Object.keys(payload.fileIds).forEach((symb) => {
      mm.files![symb].fileId = payload.fileIds[symb].fileId || null;
      mm.files![symb].previewFileId = payload.fileIds[symb].previewFileId || null;
    });
    this.storage.updateFileIds(payload);
  }

  @Mutation
  public addMessage(m: MessageModel) {
    const om: Record<number, MessageModel> = this.roomsDict[m.roomId].messages;

    /*
     * If this message is in thread
     * and parent message already loaded (so its threadMessageId is not actualanymore)
     * and this message is a new one (not syncing current message)
     */
    if (m.parentMessage && om[m.parentMessage] && !om[m.id] &&
      // And this message is not from us (otherwise we already increased message count when sending it and storing in store)
      !(m.userId === this.userInfo?.id && m.id > 0)) {
      om[m.parentMessage].threadMessagesCount++;
      this.storage.setThreadMessageCount(m.parentMessage, om[m.parentMessage].threadMessagesCount);
    }
    // Vue.set(
    om[m.id] = m;
    this.storage.saveMessage(m);
  }

  /*
   * We're saving it to database, we restored this message from.
   * seems like we can't split 2 methods, since 1 should be in actions
   * and one in mutation, but storage is not available in actions
   */
  @Mutation
  public addMessageWoDB(m: MessageModel) {

    /*
     * Calling mutation from another mutation is not allowed in vuex
     * https://github.com/championswimmer/vuex-module-decorators/issues/363
     */
    const om: Record<number, MessageModel> = this.roomsDict[m.roomId].messages;
    // Vue.set(
    om[m.id] = m;
  }

  @Mutation
  public addLiveConnectionToRoom(m: LiveConnectionLocation) {
    if (this.roomsDict[m.roomId].p2pInfo.liveConnections.includes(m.connection)) {
      throw Error("This connection is already here");
    }
    this.roomsDict[m.roomId].p2pInfo.liveConnections.push(m.connection);
  }

  @Mutation
  public removeLiveConnectionToRoom(m: LiveConnectionLocation) {
    const indexOf = this.roomsDict[m.roomId].p2pInfo.liveConnections.indexOf(m.connection);
    if (indexOf < 0) {
      throw Error("This connection is not present");
    }
    this.roomsDict[m.roomId].p2pInfo.liveConnections.splice(indexOf, 1);
  }

  @Mutation
  public markMessageAsSent(m: RoomMessagesIds) {
    const markSendingIds: number[] = [];
    m.messagesId.forEach((messageId) => {
      const message = this.roomsDict[m.roomId].messages[messageId];
      if (message.status === MessageStatusInner.SENDING) {
        message.status = MessageStatus.ON_SERVER;
        markSendingIds.push(messageId);
      }
    });
    this.storage.markMessageAsSent(markSendingIds);
  }

  @Mutation
  public deleteMessage(rm: RoomMessageIds) {
    const {messages} = this.roomsDict[rm.roomId];
    // Vue.delete(messages, String(rm.messageId));
    delete messages[rm.messageId];
    Object.values(messages).filter((m) => m.parentMessage === rm.messageId).
      forEach((a) => a.parentMessage = rm.newMessageId);
    this.storage.deleteMessage(rm.messageId, rm.newMessageId);
  }

  @Mutation
  public addMessages(ml: AddMessagesDTO) {
    const om: Record<number, MessageModel> = this.roomsDict[ml.roomId].messages;
    if (ml.syncingThreadMessageRequired) {
      const messageWithParent: Record<string, number> = {};
      ml.messages.filter((m) => m.parentMessage && !om[m.id] && om[m.parentMessage]).forEach((m) => {
        if (!messageWithParent[m.parentMessage!]) {
          messageWithParent[m.parentMessage!] = 0;
        }
        messageWithParent[m.parentMessage!]++;
      });
      Object.entries(messageWithParent).forEach(([parentRoomId, amountNewmessages]) => {
        const roomId = parseInt(parentRoomId);
        om[roomId].threadMessagesCount += amountNewmessages;
        this.storage.setThreadMessageCount(roomId, om[roomId].threadMessagesCount);
      });
    }
    ml.messages.forEach((m) => {
      // VUe.set
      om[m.id] = m;
    });
    this.storage.saveMessages(ml.messages);
  }

  @Mutation
  public addSearchMessages(ml: MessagesLocation) {
    const om: Record<number, MessageModel> = this.roomsDict[ml.roomId].search.messages;
    ml.messages.forEach((m) => {
      // Vue.set
      om[m.id] = m;
    });
  }

  @Mutation
  public setSearchTextTo(ml: SetSearchTextTo) {
    this.roomsDict[ml.roomId].search.messages = [];
    this.roomsDict[ml.roomId].search.searchText = ml.searchText;
    this.roomsDict[ml.roomId].search.locked = false;
  }

  @Mutation
  public setEditedMessage(editedMessage: EditingMessage) {
    this.roomsDict[editedMessage.roomId].messages[editedMessage.messageId].isEditingActive = editedMessage.isEditingNow;
  }

  @Mutation
  public setCurrentThread(editingThread: EditingMessage) {
    const m: MessageModel = this.roomsDict[editingThread.roomId].messages[editingThread.messageId];
    m.isThreadOpened = editingThread.isEditingNow;
  }

  @Mutation
  public setSearchStateTo(payload: SetSearchStateTo) {
    this.roomsDict[payload.roomId].search.locked = payload.lock;
  }

  @Mutation
  public toogleSearch(roomId: number) {
    this.roomsDict[roomId].search.searchActive = !this.roomsDict[roomId].search.searchActive;
  }

  @Mutation
  public setAllLoaded(roomId: number) {
    this.roomsDict[roomId].allLoaded = true;
  }

  @Mutation
  public setRoomSettings(srm: RoomSettingsModel) {
    const room = this.roomsDict[srm.id];
    if (room.name !== srm.name) {
      room.changeName.push({
        newName: srm.name,
        oldName: room.name,
        time: Date.now(),
      });
    }
    room.notifications = srm.notifications;
    room.volume = srm.volume;
    room.name = srm.name;
    room.p2p = srm.p2p;
    room.channelId = srm.channelId;
    room.isMainInChannel = srm.isMainInChannel;
    this.storage.updateRoom(srm);
  }

  @Mutation
  public clearMessages() {
    for (const m in this.roomsDict) {
      this.roomsDict[m].messages = {};
      this.roomsDict[m].allLoaded = false;
    }
    this.storage.clearMessages();
  }

  @Mutation
  public deleteRoom(roomId: number) {
    // Vue.delete(this.roomsDict, String(roomId));
    delete this.roomsDict[roomId];
    this.storage.deleteRoom(roomId);
  }

  @Mutation
  public setRoomsUsers(ru: SetRoomsUsers) {
    this.roomsDict[ru.roomId].users = ru.users;
    this.storage.saveRoomUsers(ru);
  }

  @Mutation
  public setIsOnline(isOnline: boolean) {
    this.isOnline = isOnline;
  }

  @Mutation
  public addGrowl(growlModel: GrowlModel) {
    this.growls.push(growlModel);
  }

  @Mutation
  public removeGrowl(growlModel: GrowlModel) {
    const index = this.growls.indexOf(growlModel, 0);
    if (index > -1) {
      this.growls.splice(index, 1);
    }
  }

  @Mutation
  public setActiveRoomId(id: number) {
    this.activeRoomId = id;
    localStorage.setItem(ACTIVE_ROOM_ID_LS_NAME, String(id));
  }

  @Mutation
  public setRegHeader(regHeader: string) {
    this.regHeader = regHeader;
  }

  @Mutation
  public addUser(u: UserModel) {
    // Vue.set
    this.allUsersDict[u.id] = u;
    this.storage.saveUser(u);
  }

  @Mutation
  public addRoomLog(payload: RoomLogEntry) {
    payload.roomIds.forEach((r) => {
      this.roomsDict[r].roomLog.push(payload.roomLog);
    });
  }

  @Mutation
  public setCallActiveButNotJoinedYet(payload: BooleanIdentifier) {
    this.roomsDict[payload.id].callInfo.callActiveButNotJoinedYet = payload.state;
  }

  @Mutation
  public setOnline(ids: Record<string, string[]>) {
    Object.keys(ids).forEach((k) => {
      if (ids[k].length === 0) {
        delete ids[k];
      }
    });
    this.onlineDict = ids;
  }

  @Mutation
  public setUser(user: {id: number; sex: Gender; username: string; thumbnail: string}) {
    this.allUsersDict[user.id].username = user.username;
    this.allUsersDict[user.id].sex = user.sex;
    this.allUsersDict[user.id].thumbnail = user.thumbnail;
    this.storage.saveUser(this.allUsersDict[user.id]);
  }

  @Mutation
  public setUserInfo(userInfo: CurrentUserInfoWoImage) {
    const thumbnail: string | null = this.userInfo?.thumbnail || null;
    const newUserInfo: CurrentUserInfoModel = {
      ...userInfo,
      thumbnail,
    };
    this.userInfo = newUserInfo;
    this.storage.setUserProfile(this.userInfo);
  }

  @Mutation
  public setUserSettings(userInfo: CurrentUserSettingsModel) {
    this.userSettings = userInfo;
    this.storage.setUserSettings(userInfo);
  }

  @Mutation
  public setUserImage(thumbnail: string) {
    this.userInfo!.thumbnail = thumbnail;
    this.storage.setUserProfile(this.userInfo!);
  }

  @Mutation
  public setPastingQueue(ids: PastingTextAreaElement[]) {
    this.pastingTextAreaQueue = ids;
  }

  @Mutation
  public setStateFromWS(state: SetStateFromWS) {
    logger.debug("init store from WS")();

    this.roomsDict = state.roomsDict;
    this.channelsDict = state.channelsDict;
    this.allUsersDict = state.allUsersDict;

    this.storage.setChannels(Object.values(this.channelsDict));
    this.storage.setRooms(Object.values(this.roomsDict));
    this.storage.setUsers(Object.values(this.allUsersDict));
  }

  @Mutation
  public setCountryCode(locations: Record<string, Location>) {
    Object.values(this.allUsersDict).forEach((u) => {
      if (locations[u.id]) {
        u.location = locations[u.id];
      }
    });
    this.storage.setUsers(Object.values(this.allUsersDict));
  }

  @Mutation
  // Called while restoring from db
  public setStateFromStorage(setRooms: SetStateFromStorage) {
    logger.debug("init store from database")();
    this.roomsDict = setRooms.roomsDict;
    this.userInfo = setRooms.profile;
    this.userSettings = setRooms.settings;
    this.allUsersDict = setRooms.allUsersDict;
    this.channelsDict = setRooms.channelsDict;
  }

  @Mutation
  public addRoom(room: RoomModel) {
    this.roomsDict[room.id] = room;
    // Vue.set(, String(room.id), room);
    this.storage.saveRoom(room);
  }

  @Mutation
  public addChannel(channel: ChannelModel) {
    // Vue.set(, String(), channel);
    this.channelsDict[channel.id] = channel;
    this.storage.saveChannel(channel);
  }

  @Mutation
  public deleteChannel(channelId: number) {
    // Vue.delete(this.channelsDict, String(channelId));
    delete this.channelsDict[channelId];
    this.storage.deleteChannel(channelId);
  }

  @Mutation
  public setShowITypingUser({userId, roomId, date}: {userId: number; roomId: number; date: number}) {
    if (date === 0) {
      // Vue.delete(, userId);
      delete this.roomsDict[roomId].usersTyping[userId];
    } else {
      // Vue.set(, userId, date);
      this.roomsDict[roomId].usersTyping[userId] = date;
    }
  }

  @Mutation
  public clearGrowls() {
    this.growls = [];
  }

  @Mutation
  public logout() {
    this.userInfo = null;
    this.userSettings = null;
    this.roomsDict = {};
    this.allUsersDict = {};
    this.onlineDict = {};
    this.activeRoomId = null;
    localStorage.clear(); // Remove LAST_SYNC, serviceWorkerUrl, sessionId, smileyRecent and other trash
    this.storage.clearStorage();
  }

  @Action
  public async showGrowl({html, type, time}: {html: string; type: GrowlType; time: number}) {
    const growl: GrowlModel = {
      id: Date.now(),
      html,
      type,
    };
    this.addGrowl(growl);
    await sleep(time);
    this.removeGrowl(growl);
  }

  @Action
  public async showUserIsTyping({userId, roomId}: {userId: number; roomId: number}) {
    const date = Date.now();
    this.setShowITypingUser({
      userId,
      roomId,
      date,
    });
    await sleep(SHOW_I_TYPING_INTERVAL_SHOW); // Lets say 1 second ping
    if (this.roomsDict[roomId].usersTyping[userId] === date) {
      this.setShowITypingUser({
        userId,
        roomId,
        date: 0,
      });
    }
  }

  @Action
  public async growlErrorRaw(html: string) {
    await this.showGrowl({
      html,
      type: GrowlType.ERROR,
      time: 6000,
    });
  }

  @Action
  public async growlError(title: string) {
    await this.showGrowl({
      html: encodeHTML(title),
      type: GrowlType.ERROR,
      time: 6000,
    });
  }

  @Action
  public async growlInfo(title: string) {
    await this.showGrowl({
      html: encodeHTML(title),
      type: GrowlType.INFO,
      time: 5000,
    });
  }

  @Action
  public async growlSuccess(title: string) {
    await this.showGrowl({
      html: encodeHTML(title),
      type: GrowlType.SUCCESS,
      time: 4000,
    });
  }
}
