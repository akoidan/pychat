import loggerFactory from '@/ts/instances/loggerFactory';
import Api from '@/ts/message_handlers/Api';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import {
  MessageSender,
  RemoveMessageProgress,
  RoomMessageIds,
  SetMessageProgress,
  SetMessageProgressError,
  SetUploadProgress,
  UploadFile
} from '@/ts/types/types';
import {
  FileModel,
  MessageModel,
  RoomModel
} from '@/ts/types/model';
import { Logger } from 'lines-logger';

import {
  FileModelDto,
  MessageModelDto,
  SaveFileResponse
} from '@/ts/types/dto';
import WsHandler from '@/ts/message_handlers/WsHandler';
import { sub } from '@/ts/instances/subInstance';
import { DefaultStore } from '@/ts/classes/DefaultStore';

import { InternetAppearMessage } from '@/ts/types/messages/innerMessages';
import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import {
  DeleteMessage,
  EditMessage,
  PrintMessage
} from '@/ts/types/messages/wsInMessages';
import { savedFiles } from '@/ts/utils/htmlApi';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';
import {MESSAGES_PER_SEARCH} from '@/ts/utils/consts';


export default class WsMessageHandler extends MessageHandler implements MessageSender {

  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WsMessageHandler, 'ws-message'> = {
    deleteMessage:  <HandlerType<'deleteMessage', 'ws-message'>>this.deleteMessage,
    editMessage:  <HandlerType<'editMessage', 'ws-message'>>this.editMessage,
    printMessage:  <HandlerType<'printMessage', 'ws-message'>>this.printMessage,
    internetAppear:  <HandlerType<'internetAppear', HandlerName>>this.internetAppear
  };

  // messageRetrier uses MessageModel.id as unique identifier, do NOT use it with any types but
  // Send message, delete message, edit message, as it will have the sameId which could erase some callback
  private readonly store: DefaultStore;
  private readonly api: Api;
  private readonly ws: WsHandler;
  private syncMessageLock: boolean = false;
  private readonly messageHelper: MessageHelper;

  constructor(
      store: DefaultStore,
      api: Api,
      ws: WsHandler,
      messageHelper: MessageHelper,
  ) {
    super();
    this.store = store;
    this.api = api;
    sub.subscribe('ws-message', this);
    this.logger = loggerFactory.getLogger('ws-message');
    this.ws = ws;
    this.messageHelper = messageHelper;
  }

  public async syncMessages(): Promise<void> {
    if (this.syncMessageLock) {
      this.logger.warn('Exiting from sync message because, the lock is already acquired')();
      return;
    }
    try {
      this.syncMessageLock = true;
      for (const room of this.store.roomsArray) {
        if (room.p2p) {
          continue;
        }
        for (const message of  Object.values(room.messages)) {
          if (message.sending) {
              await this.syncMessage(room.id, message.id);
          }
        }
      }
    } catch (e) {
      this.logger.error('Can\'t send messages because {}', e)();
    } finally {
      this.syncMessageLock = false;
    }
  }


  async loadMessages(roomId: number, messageIds: number[]): Promise<void> {
    this.logger.log("Asking for messages {}", messageIds)();
    let respones = await this.ws.sendLoadMessagesByIds(roomId, messageIds);
    this.addMessages(roomId, respones.content);
  }

  async loadUpSearchMessages(roomId: number, count: number, requestInterceptor?: (a: XMLHttpRequest) => void) {
    let room: RoomModel = this.store.roomsDict[roomId];
    let result = false;
    if (!room.search.locked) {
      let messagesDto: MessageModelDto[] = await this.api.search(room.search.searchText, roomId, Object.keys(room.search.messages).length, requestInterceptor);
      this.logger.log("Got {} messages from the server", messagesDto.length)();
      if (messagesDto.length) {
        result = true;
        this.addSearchMessages(roomId, messagesDto);
      }
      this.store.setSearchStateTo({roomId, lock: messagesDto.length < MESSAGES_PER_SEARCH});
    }
    return result;
  }

  async loadUpMessages(roomId: number, count: number): Promise<void> {
    if (!this.store.roomsDict[roomId].allLoaded) {
      let lm = await this.ws.sendLoadMessages(roomId, this.store.minId(roomId), count);
      if (lm.content.length > 0) {
        this.addMessages(lm.roomId, lm.content);
      } else {
        this.store.setAllLoaded(lm.roomId);
      }
    }
  }

  public async syncMessage(roomId: number, messageId: number): Promise<void> {
    let storeMessage = this.store.roomsDict[roomId].messages[messageId];
    if (!storeMessage.content && storeMessage.id < 0) {
      // should not be here;
      throw Error("why we are here?");
    }
    await this.uploadFilesForMessages(storeMessage);
    storeMessage = this.store.roomsDict[roomId].messages[messageId];
    let fileIds: number[] = this.getFileIdsFromMessage(storeMessage);
    if (storeMessage.id < 0 && storeMessage.content) {
      await this.ws.sendPrintMessage(storeMessage.content, roomId, fileIds, storeMessage.id, Date.now() - storeMessage.time, storeMessage.parentMessage);
      const rmMes: RoomMessageIds = {
        messageId: storeMessage.id,
        roomId: storeMessage.roomId
      };
      this.store.deleteMessage(rmMes);
    } else if (storeMessage.id > 0) {
      this.ws.sendEditMessage(storeMessage.content, storeMessage.id, fileIds);
    } else if (!storeMessage.content && storeMessage.id < 0) {
      throw Error("Should not be here"); // this messages should be removed
    }
  }

  public async uploadFiles(
      messageId: number,
      roomId: number,
      files: UploadFile[]
  ): Promise<SaveFileResponse> {
    let size: number = 0;
    files.forEach(f => size += f.file.size);
    const sup: SetUploadProgress = {
      upload: {
        total: size,
        uploaded: 0
      },
      messageId,
      roomId
    };
    this.store.setUploadProgress(sup);
    try {
      const res: SaveFileResponse = await this.api.uploadFiles(files, evt => {
        if (evt.lengthComputable) {
          const payload: SetMessageProgress = {
            messageId,
            roomId,
            uploaded: evt.loaded
          };
          this.store.setMessageProgress(payload);
        }
      });
      const newVar: RemoveMessageProgress = {
        messageId, roomId
      };
      this.store.removeMessageProgress(newVar);
      if (!res || Object.keys(res).length  === 0) {
        throw Error('Missing files uploads');
      }

      return res;
    } catch (error) {
      const newVar: SetMessageProgressError = {
        messageId,
        roomId,
        error
      };
      this.store.setMessageProgressError(newVar);
      throw error;
    }

  }
  public addMessages(roomId: number, inMessages: MessageModelDto[]) {
    const oldMessages: { [id: number]: MessageModel } = this.store.roomsDict[roomId].messages;
    const newMesages: MessageModelDto[] = inMessages.filter(i => !oldMessages[i.id]);
    const messages: MessageModel[] = newMesages.map(this.getMessage.bind(this));
    this.store.addMessages({messages, roomId: roomId});
  }

  public addSearchMessages(roomId: number, inMessages: MessageModelDto[]) {
    const oldMessages: { [id: number]: MessageModel } = this.store.roomsDict[roomId].search.messages;
    const newMesages: MessageModelDto[] = inMessages.filter(i => !oldMessages[i.id]);
    const messages: MessageModel[] = newMesages.map(this.getMessage.bind(this));
    this.store.addSearchMessages({messages, roomId: roomId});
  }


  protected getMethodHandlers() {
    return this.handlers;
  }

  public deleteMessage(inMessage: DeleteMessage) {
    let message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to delete it', inMessage)();
    } else {
      message = {
        id: message.id,
        time: message.time,
        files: message.files,
        content: null,
        isThreadOpened: false,
        isEditingActive: false,
        parentMessage: message.parentMessage,
        symbol: message.symbol || null,
        isHighlighted: false,
        sending: false,
        edited: inMessage.edited,
        roomId: message.roomId,
        userId: message.userId,
        transfer: null,
        giphy: message.giphy || null,
        deleted: true
      };
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
    }
  }

  public editMessage(inMessage: EditMessage) {
    const message: MessageModel = this.store.roomsDict[inMessage.roomId].messages[inMessage.id];
    if (!message) {
      this.logger.debug('Unable to find message {} to edit it', inMessage)();
    } else {
      const message: MessageModel = this.getMessage(inMessage);
      this.logger.debug('Adding message to storage {}', message)();
      this.store.addMessage(message);
    }
  }


  public printMessage(inMessage: PrintMessage) {
    const message: MessageModel = this.getMessage(inMessage);
    this.messageHelper.processUnkownP2pMessage(message);

  }


  private getFileIdsFromMessage(storeMessage: MessageModel): number[] {
    let files: number[] = []
    if (storeMessage.files) {
      let fileValues = Object.values(storeMessage.files);
      if (fileValues.find(f => !f.fileId && f.sending)) {
        throw Error('New files were added during upload') // TODO
      }
      fileValues.forEach(fv => {
        files.push(fv.fileId!)
        if (fv.previewFileId) {
          files.push(fv.previewFileId)
        }
      });
    }
    return files;
  }

  private async uploadFilesForMessages(storeMessage: MessageModel) {
    if (storeMessage.files) {
      let uploadFiles: UploadFile[] = [];
      Object.keys(storeMessage.files)
          .filter(k => !storeMessage.files![k].fileId && storeMessage.files![k].sending)
          .forEach(k => {
            let file: FileModel = storeMessage.files![k];
            uploadFiles.push({
              file: savedFiles[file.url!], // TODO why null?
              key: file.type + k
            });
            if (file.preview) {
              uploadFiles.push({
                file: savedFiles[file.preview],
                key: `p${k}`
              });
            }
          });
      if (uploadFiles.length > 0) {
        let fileIds = await this.uploadFiles(storeMessage.id, storeMessage.roomId, uploadFiles);
        this.store.setMessageFileIds({roomId: storeMessage.roomId, messageId: storeMessage.id, fileIds});
      }
    }
  }

  private getMessage(message: MessageModelDto): MessageModel {
    function convertFiles(dtos: {[id: number]: FileModelDto}): {[id: number]: FileModel} {
      const res: {[id: number]: FileModel} = {};
      for (const k in dtos) {
        let dto = dtos[k];
        res[k] = {
          fileId: null,
          sending: false,
          previewFileId: null,
          preview: dto.preview,
          type: dto.type,
          url: dto.url
        }
      }
      return res;
    }

    return {
      id: message.id,
      time: this.ws.convertServerTimeToPC(message.time),
      isHighlighted: false,
      files: message.files ? convertFiles(message.files) : null,
      content: message.content || null,
      symbol: message.symbol || null,
      edited: message.edited || null,
      isEditingActive: false,
      isThreadOpened: false,
      roomId: message.roomId,
      userId: message.userId,
      transfer: null,
      parentMessage: message.parentMessage,
      sending: false, // this code is only called from WsInMessagew which means it's synced
      giphy: message.giphy || null,
      deleted: message.deleted || false
    };
  }

  public async internetAppear(m : InternetAppearMessage) {
    this.syncMessages();
  }
}
