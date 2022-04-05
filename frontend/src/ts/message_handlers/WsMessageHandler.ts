import loggerFactory from "@/ts/instances/loggerFactory";
import type Api from "@/ts/message_handlers/Api";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {
  MessageSender,
  RemoveMessageProgress,
  RoomMessageIds,
  SetMessageProgress,
  SetMessageProgressError,
  SetUploadProgress,
  UploadFile,
} from "@/ts/types/types";
import type {
  FileModel,
  MessageModel,
  MessageStatus,
  RoomModel,
} from "@/ts/types/model";
import type {Logger} from "lines-logger";

import type {
  GiphyDto,
  MessageModelDto,
  SaveFileResponse,
} from "@/ts/types/dto";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";

import type {InternetAppearMessage} from "@/ts/types/messages/innerMessages";
import type {
  HandlerName,
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  DeleteMessage,
  EditMessage,
  MessagesResponseMessage,
  PrintMessage,
  SetMessageStatusMessage,
  SyncHistoryResponseMessage,
} from "@/ts/types/messages/wsInMessages";
import {savedFiles} from "@/ts/utils/htmlApi";
import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";
import {
  LAST_SYNCED,
  MESSAGES_PER_SEARCH,
} from "@/ts/utils/consts";
import {convertMessageModelDtoToModel} from "@/ts/types/converters";
import {
  checkIfIdIsMissing,
  getMissingIds,
} from "@/ts/utils/pureFunctions";
import type Subscription from "@/ts/classes/Subscription";

export default class WsMessageHandler extends MessageHandler implements MessageSender {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WsMessageHandler, "ws-message"> = {
    deleteMessage: <HandlerType<"deleteMessage", "ws-message">> this.deleteMessage,
    editMessage: <HandlerType<"editMessage", "ws-message">> this.editMessage,
    printMessage: <HandlerType<"printMessage", "ws-message">> this.printMessage,
    internetAppear: <HandlerType<"internetAppear", HandlerName>> this.internetAppear,
    setMessageStatus: <HandlerType<"setMessageStatus", "ws-message">> this.setMessageStatus,
  };

  /*
   * MessageRetrier uses MessageModel.id as unique identifier, do NOT use it with any types but
   * Send message, delete message, edit message, as it will have the sameId which could erase some callback
   */
  private readonly store: DefaultStore;

  private readonly api: Api;

  private readonly ws: WsHandler;

  private syncMessageLock: boolean = false;

  private readonly messageHelper: MessageHelper;

  public constructor(
    store: DefaultStore,
    api: Api,
    ws: WsHandler,
    messageHelper: MessageHelper,
    sub: Subscription,
  ) {
    super();
    this.store = store;
    this.api = api;
    sub.subscribe("ws-message", this);
    this.logger = loggerFactory.getLogger("ws-message");
    this.ws = ws;
    this.messageHelper = messageHelper;
  }

  public async markMessagesInCurrentRoomAsRead(roomId: number, messagesIds: number[]) {
    await this.ws.setMessageStatus(
      messagesIds,
      roomId,
      "read",
    );
  }

  public async syncMessages(): Promise<void> {
    this.logger.log("Syncing messages")();
    if (this.syncMessageLock) {
      this.logger.warn("Exiting from sync message because, the lock is already acquired")();
      return;
    }
    try {
      this.syncMessageLock = true;
      for (const room of this.store.roomsArray) {
        if (room.p2p) {
          continue;
        }
        const messages = Object.values(room.messages).filter((m) => m.status === "sending");
        // Sync messages w/o parent thread first
        messages.sort((a, b) => {
          if (a.parentMessage && !b.parentMessage) {
            return 1;
          } else if (b.parentMessage && !a.parentMessage) {
            return -1;
          }
          return 0;
        });
        for (const message of messages) {
          await this.syncMessage(room.id, message.id);
        }
      }
    } catch (e) {
      this.logger.error("Can't send messages because {}", e)();
    } finally {
      this.syncMessageLock = false;
    }
  }

  public async loadMessages(roomId: number, messagesIds: number[]): Promise<void> {
    this.logger.log("Asking for messages {}", messagesIds)();
    const respones = await this.ws.sendLoadMessagesByIds(roomId, messagesIds);
    this.addMessages(roomId, respones.content);
  }

  public async loadUpSearchMessages(roomId: number, count: number, checkIfSet: (found: boolean) => boolean) {
    const room: RoomModel = this.store.roomsDict[roomId];
    if (!room.search.locked) {
      const response: MessagesResponseMessage = await this.ws.search(room.search.searchText, roomId, Object.keys(room.search.messages).length);
      const messagesDto = response.content;
      this.logger.log("Got {} messages from the server", messagesDto.length)();
      if (checkIfSet(messagesDto.length > 0)) {
        if (messagesDto.length > 0) {
          this.addSearchMessages(roomId, messagesDto);
        }
        this.store.setSearchStateTo({
          roomId,
          lock: messagesDto.length < MESSAGES_PER_SEARCH,
        });
      }
    } else {
      checkIfSet(false);
    }
  }

  public async loadThreadMessages(roomId: number, threadId: number): Promise<void> {
    const room = this.store.roomsDict[roomId];
    const myids: number[] = Object.values(room.messages).filter((a) => a.parentMessage === threadId && a.id > 0).
      map((m) => m.id);
    const lm = await this.ws.sendLoadMessages(roomId, 0, threadId, myids);
    if (lm.content.length > 0) {
      this.addMessages(roomId, lm.content);
    } else {
      this.logger.error("Got empty messages response from loadThreadMessages")();
    }
  }

  public async loadUpMessages(roomId: number, count: number): Promise<void> {
    const room = this.store.roomsDict[roomId];
    if (!room.allLoaded) {
      const myids: number[] = Object.values(room.messages).map((m) => m.id).
        filter((a) => a > 0);
      const lm = await this.ws.sendLoadMessages(roomId, count, null, myids);
      if (lm.content.length > 0) {
        // Backend return messages that don't have thread, so we don't neeed to sync parent message here
        this.addMessages(roomId, lm.content);
      } else {
        this.store.setAllLoaded(roomId);
      }
    } else {
      this.logger.debug(`No more loading for room '${room.name}' #${room.id}`)();
    }
  }

  public async syncMessage(roomId: number, messageId: number): Promise<void> {
    let storeMessage = this.store.roomsDict[roomId].messages[messageId];
    if (!storeMessage.content && storeMessage.id < 0) {
      // Should not be here;
      throw Error("why we are here?");
    }
    await this.uploadFilesForMessages(storeMessage);
    storeMessage = this.store.roomsDict[roomId].messages[messageId];
    const fileIds: number[] = this.getFileIdsFromMessage(storeMessage);
    const giphies: GiphyDto[] = this.getGiphiesFromMessage(storeMessage);
    if (storeMessage.id < 0 && storeMessage.content) {
      const a: PrintMessage = await this.ws.sendPrintMessage(
        storeMessage.content,
        roomId,
        fileIds,
        storeMessage.id,
        Date.now() - storeMessage.time,
        storeMessage.parentMessage,
        {...storeMessage.tags},
        giphies,
      );
      const rmMes: RoomMessageIds = {
        messageId: storeMessage.id,
        roomId: storeMessage.roomId,
        newMessageId: a.id,
      };
      this.store.deleteMessage(rmMes);
    } else if (storeMessage.id > 0) {
      this.ws.sendEditMessage(storeMessage.content, storeMessage.id, fileIds, storeMessage.tags, giphies);
    } else if (!storeMessage.content && storeMessage.id < 0) {
      throw Error("Should not be here"); // This messages should be removed
    }
  }

  public async uploadFiles(
    messageId: number,
    roomId: number,
    files: UploadFile[],
  ): Promise<SaveFileResponse> {
    let size: number = 0;
    files.forEach((f) => size += f.file.size);
    const sup: SetUploadProgress = {
      upload: {
        total: size,
        uploaded: 0,
      },
      messageId,
      roomId,
    };
    this.store.setUploadProgress(sup);
    try {
      const res: SaveFileResponse = await this.api.uploadFiles(
        files,
        (evt) => {
          if (evt.lengthComputable) {
            const payload: SetMessageProgress = {
              messageId,
              roomId,
              uploaded: evt.loaded,
            };
            this.store.setMessageProgress(payload);
          }
        },
        (xhr) => {
          this.store.setUploadXHR({
            xhr,
            messageId,
            roomId,
          });
        },
      );
      const newVar: RemoveMessageProgress = {
        messageId,
        roomId,
      };
      this.store.removeMessageProgress(newVar);
      if (!res || Object.keys(res).length === 0) {
        throw Error("Missing files uploads");
      }

      return res;
    } catch (error: any) {
      const newVar: SetMessageProgressError = {
        messageId,
        roomId,
        error,
      };
      this.store.setMessageProgressError(newVar);
      throw error;
    }
  }

  public addMessages(roomId: number, inMessages: MessageModelDto[], syncingThreadMessageRequired?: true) {
    this.updateMessagesStatusIfRequired(roomId, inMessages);
    const oldMessages: Record<number, MessageModel> = this.store.roomsDict[roomId].messages;
    const newMesages: MessageModelDto[] = inMessages.filter((i) => !oldMessages[i.id]); // TODO this is no longer required, probably
    const messages: MessageModel[] = newMesages.map((nm) => convertMessageModelDtoToModel(nm, null, (time) => this.ws.convertServerTimeToPC(time)));
    this.store.addMessages({
      messages,
      roomId,
      syncingThreadMessageRequired,
    });
  }

  public addSearchMessages(roomId: number, inMessages: MessageModelDto[]) {
    const oldMessages: Record<number, MessageModel> = this.store.roomsDict[roomId].search.messages;
    const newMesages: MessageModelDto[] = inMessages.filter((i) => !oldMessages[i.id]);
    const messages: MessageModel[] = newMesages.map((nm) => convertMessageModelDtoToModel(nm, null, (time) => this.ws.convertServerTimeToPC(time)));
    this.store.addSearchMessages({
      messages,
      roomId,
    });
  }

  public deleteMessage(inMessage: DeleteMessage) {
    let message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.warn("Unable to find message {} to delete it", inMessage)();
    } else if (checkIfIdIsMissing(message, this.store)) {
      this.logger.warn("This message won't be displayed since we havent loaded its thread yet", inMessage)();
    } else {
      message = {
        id: message.id,
        time: message.time,
        files: message.files,
        content: null,
        tags: {},
        isThreadOpened: false,
        isEditingActive: false,
        parentMessage: message.parentMessage,
        symbol: message.symbol || null,
        threadMessagesCount: message.threadMessagesCount,
        isHighlighted: false,
        status: message.status === "sending" ? "on_server" : message.status,
        edited: inMessage.edited,
        roomId: message.roomId,
        userId: message.userId,
        transfer: null,
        deleted: true,
      };
      this.logger.debug("Adding message to storage {}", message)();
      this.store.addMessage(message);
    }
  }

  public async editMessage(inMessage: EditMessage) {
    const message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug("Unable to find message {} to edit it", inMessage)();
    } else {
      const convertedMessage: MessageModel = convertMessageModelDtoToModel(inMessage, message, (time) => this.ws.convertServerTimeToPC(time));
      this.logger.debug("Adding message to storage {}", convertedMessage)();
      this.store.addMessage(convertedMessage);
      if (checkIfIdIsMissing(convertedMessage, this.store)) {
        await this.loadMessages(convertedMessage.roomId, [convertedMessage.parentMessage!]);
      }
    }
  }

  public async printMessage(inMessage: PrintMessage) {
    const message: MessageModel = convertMessageModelDtoToModel(inMessage, null, (time) => this.ws.convertServerTimeToPC(time));
    this.messageHelper.processUnknownP2pMessage(message);
    if (inMessage.userId !== this.store.myId) {
      const isRead = this.store.isCurrentWindowActive && this.store.activeRoomId === inMessage.roomId;
      this.ws.setMessageStatus(
        [inMessage.id],
        inMessage.roomId,
        isRead ? "read" : "received",
      );
    }
    if (checkIfIdIsMissing(message, this.store)) {
      await this.loadMessages(message.roomId, [message.parentMessage!]);
    }
  }

  public async internetAppear(m: InternetAppearMessage) {
    this.syncMessages(); // If message was edited, or changed by server
    this.syncHistory(); // If some messages were sent during offline
  }

  public async setMessageStatus(m: SetMessageStatusMessage) {
    this.store.setMessagesStatus({
      roomId: m.roomId,
      status: m.status,
      messagesIds: m.messagesIds,
    });
  }

  private getGiphiesFromMessage(storeMessage: MessageModel): GiphyDto[] {
    if (!storeMessage.files) {
      return [];
    }
    return Object.entries(storeMessage.files).filter(([k, v]) => v.type === "g" && !v.serverId).
      map(([k, v]) => ({
        url: v.url!,
        symbol: k,
        webp: v.preview!,
      }));
  }

  private getFileIdsFromMessage(storeMessage: MessageModel): number[] {
    const files: number[] = [];
    if (storeMessage.files) {
      const fileValues = Object.values(storeMessage.files);
      if (fileValues.find((f) => !f.fileId && f.sending)) {
        throw Error("New files were added during upload"); // TODO
      }
      fileValues.filter((fv) => fv.type !== "g").forEach((fv) => {
        files.push(fv.fileId!);
        if (fv.previewFileId) {
          files.push(fv.previewFileId);
        }
      });
    }
    return files;
  }

  private async uploadFilesForMessages(storeMessage: MessageModel) {
    if (storeMessage.files) {
      const uploadFiles: UploadFile[] = [];
      Object.keys(storeMessage.files).filter((k) => !storeMessage.files![k].fileId && storeMessage.files![k].sending).
        forEach((k) => {
          const file: FileModel = storeMessage.files![k];
          uploadFiles.push({
            file: savedFiles[file.url!], // TODO why null?
            key: file.type + k,
          });
          if (file.preview) {
            uploadFiles.push({
              file: savedFiles[file.preview],
              key: `p${k}`,
            });
          }
        });
      if (uploadFiles.length > 0) {
        const fileIds = await this.uploadFiles(storeMessage.id, storeMessage.roomId, uploadFiles);
        this.store.setMessageFileIds({
          roomId: storeMessage.roomId,
          messageId: storeMessage.id,
          fileIds,
        });
      }
    }
  }

  private setAllMessagesStatus(inMessagesIds: number[], status: MessageStatus) {
    if (inMessagesIds.length === 0) {
      return;
    }
    this.store.roomsArray.forEach((r) => {
      const messagesIds = Object.values(r.messages).map((m) => m.id).
        filter((id) => inMessagesIds.includes(id));
      if (messagesIds.length > 0) {
        this.store.setMessagesStatus({
          messagesIds,
          roomId: r.id,
          status,
        });
      }
    });
  }

  private async syncHistory() {
    this.logger.log("Syncing history")();
    const messagesIds: number[] = [];
    const receivedMessageIds: number[] = [];
    const onServerMessageIds: number[] = [];

    /*
     * ReadMessageIds and receivedMessageIds - can be my messages from another device
     * so I don't need to mark them as read, but rather filter first
     */

    const roomIds: number[] = this.store.roomsArray.map((r) => {
      let roomMessage = Object.values(r.messages).filter((m) => m.id > 0);
      messagesIds.push(...roomMessage.map((m) => m.id));
      roomMessage = roomMessage.filter((u) => u.userId === this.store.myId);
      receivedMessageIds.push(...roomMessage.filter((m) => m.status === "received").map((m) => m.id));
      onServerMessageIds.push(...roomMessage.filter((m) => m.status === "on_server").map((m) => m.id));
      return r.id;
    });

    let joined: any = localStorage.getItem(LAST_SYNCED);
    if (!joined) {
      this.logger.debug(`Syncing messsages won't happen, because LAST_SYNCED is '${LAST_SYNCED}'`)();
      localStorage.setItem(LAST_SYNCED, Date.now().toString());
      return;
    }
    joined = parseInt(joined);

    const result: SyncHistoryResponseMessage = await this.ws.syncHistory(
      roomIds,
      messagesIds,
      receivedMessageIds,
      onServerMessageIds,
      Date.now() - joined,
    );

    // Updating information if message that I sent were received/read
    this.setAllMessagesStatus(result.readMessageIds, "read");
    this.setAllMessagesStatus(result.receivedMessageIds, "received");

    const messagesByStatus = this.groupMessagesIdsByStatus(result.content, () => true);
    Object.entries(messagesByStatus).forEach(([k, messagesInGroup]) => {
      const roomId = parseInt(k);
      this.addMessages(roomId, messagesInGroup, true);
      const missingIds = getMissingIds(roomId, this.store);
      if (missingIds.length) {
        // When we load new messages, they can be from thread we don't have
        this.loadMessages(roomId, missingIds);
      }
    });

    localStorage.setItem(LAST_SYNCED, Date.now().toString());
  }


  private groupMessagesIdsByStatus(messages: MessageModelDto[], predicate: (m: MessageModelDto) => boolean): Record<number, MessageModelDto[]> {
    return messages.reduce<Record<number, MessageModelDto[]>>((rv, x) => {
      if (predicate(x)) {
        if (!rv[x.roomId]) {
          rv[x.roomId] = [];
        }
        rv[x.roomId].push(x);
      }
      return rv;
    }, {});
  }

  private updateMessagesStatusIfRequired(roomId: number, inMessages: MessageModelDto[]) {
    let ids: number[];
    let messageStatus: MessageStatus;
    if (roomId === this.store.activeRoomId) {
      ids = inMessages.

        /*
         * If we received a message from the server from our second device
         * We still don't need to mark those messages as received
         */
        filter((m) => m.userId !== this.store.myId && (m.status === "received" || m.status === "on_server")).map((m) => m.id);
      messageStatus = "read";
    } else {
      ids = inMessages.filter((m) => m.status === "on_server").map((m) => m.id);
      messageStatus = "received";
    }
    if (ids.length > 0) {
      this.ws.setMessageStatus(
        ids,
        roomId,
        messageStatus,
      );
    }
  }
}
