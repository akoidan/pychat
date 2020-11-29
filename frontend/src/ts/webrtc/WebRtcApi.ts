import loggerFactory from '@/ts/instances/loggerFactory';
import { Logger } from 'lines-logger';
import WsHandler from '@/ts/message_handlers/WsHandler';
import {
  FileTransferStatus,
  ReceivingFile
} from '@/ts/types/model';
import FileHandler from '@/ts/webrtc/file/FileHandler';
import NotifierHandler from '@/ts/classes/NotificationHandler';
import MessageHandler from '@/ts/message_handlers/MesageHandler';
import { sub } from '@/ts/instances/subInstance';
import { MAX_ACCEPT_FILE_SIZE_WO_FS_API } from '@/ts/utils/consts';
import { requestFileSystem } from '@/ts/utils/htmlApi';
import FileReceiverPeerConnection from '@/ts/webrtc/file/FileReceiveerPeerConnection';
import Subscription from '@/ts/classes/Subscription';
import CallHandler from '@/ts/webrtc/call/CallHandler';
import faviconUrl from '@/assets/img/favicon.ico';
import { DefaultStore } from '@/ts/classes/DefaultStore';
import { browserVersion } from '@/ts/utils/runtimeConsts';
import MessageTransferHandler from '@/ts/webrtc/message/MessageTransferHandler';
import { bytesToSize } from '@/ts/utils/pureFunctions';
import {
  OfferCall,
  OfferFile,
  OfferMessage,
  WebRtcSetConnectionIdMessage
} from '@/ts/types/messages/wsInMessages';
import {
  HandlerName,
  HandlerType,
  HandlerTypes
} from '@/ts/types/messages/baseMessagesInterfaces';
import { VideoType } from '@/ts/types/types';
import {
  ChangeP2pRoomInfoMessage,
  InternetAppearMessage,
  LogoutMessage
} from '@/ts/types/messages/innerMessages';
import { MessageHelper } from '@/ts/message_handlers/MessageHelper';

export default class WebRtcApi extends MessageHandler {

  protected logger: Logger;

  protected readonly handlers: HandlerTypes<keyof WebRtcApi, 'webrtc'>  = {
    offerFile: <HandlerType<'offerFile', 'webrtc'>>this.offerFile,
    changeDevices: <HandlerType<'changeDevices', 'webrtc'>>this.changeDevices,
    offerCall: <HandlerType<'offerCall', 'webrtc'>>this.offerCall,
    offerMessage: <HandlerType<'offerMessage', 'webrtc'>>this.offerMessage,
    logout: <HandlerType<'logout', HandlerName>>this.logout,
    internetAppear:  <HandlerType<'internetAppear', HandlerName>>this.internetAppear
  };

  private readonly wsHandler: WsHandler;
  private readonly store: DefaultStore;
  private readonly notifier: NotifierHandler;
  private readonly callHandlers: {[id: number]: CallHandler} = {};
  private readonly messageHandlers: Record<number, MessageTransferHandler> = {};
  private readonly messageHelper: MessageHelper;

  constructor(ws: WsHandler, store: DefaultStore, notifier: NotifierHandler, messageHelper: MessageHelper) {
    super();
    sub.subscribe('webrtc', this);
    this.wsHandler = ws;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC');
    this.store = store;
    this.messageHelper = messageHelper;
  }

  public offerCall(message: OfferCall) {
    this.getCallHandler(message.roomId).initAndDisplayOffer(message);
  }

  public async changeDevices(m: ChangeP2pRoomInfoMessage): Promise<void> {
    this.logger.log('change devices {}', m)();
    if (m.changeType === 'i_deleted') { // destroy my room
      let mh: MessageTransferHandler = this.messageHandlers[m.roomId!];
      if (mh) {
        mh.destroyThisTransferHandler();
      }
      delete this.messageHandlers[m.roomId!];
      return;
    } else if (this.store.roomsDict[m.roomId!]?.p2p) {
      //  'someone_left' - destroy peer connection in this room
      //  'room_created' - send to everyone when new room is created
      //  'someone_joined' - send to everyone when someone joins the room, but the member who joins receives 'invited'
      await this.getMessageHandler(m.roomId!).initOrSync();
    }
  }

  initAndSyncMessages() {
    this.store.roomsArray.forEach(room => {
      if (room.p2p) {
        this.getMessageHandler(room.id).initOrSync();
      }
    });
  }

  public internetAppear(m: InternetAppearMessage) {
    this.initAndSyncMessages();
  }

  public offerMessage(message: OfferMessage) {
    this.getMessageHandler(message.roomId).acceptConnection(message);
  }

  public acceptFile(connId: string, webRtcOpponentId: string) {
    sub.notify({action: 'acceptFileReply', handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId)});
  }

  public declineSending(connId: string, webRtcOpponentId: string) {
    sub.notify({action: 'declineSending', handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId)});
  }

  public declineFile(connId: string, webRtcOpponentId: string) {
    sub.notify({action: 'declineFileReply', handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId)});
  }

  public async sendFileOffer(file: File, channel: number) {
    if (file.size > 0) {
      const e: WebRtcSetConnectionIdMessage = await this.wsHandler.offerFile(channel, browserVersion, file.name, file.size);
      new FileHandler(channel, e.connId, this.wsHandler, this.notifier, this.store, file, this.wsHandler.convertServerTimeToPC(e.time));
    } else {
      this.store.growlError(`File ${file.name} size is 0. Skipping sending it...`);
    }
  }

  public retryFile(connId: string, webRtcOpponentId: string) {
    sub.notify({action: 'retryFileReply', handler: Subscription.getPeerConnectionId(connId, webRtcOpponentId)});

  }

  public getCallHandler(roomId: number): CallHandler {
    if (!this.callHandlers[roomId]) {
      this.callHandlers[roomId] = new CallHandler(roomId, this.wsHandler, this.notifier, this.store);
    }

    return this.callHandlers[roomId];
  }

  public getMessageHandler(roomId: number): MessageTransferHandler {
    if (!this.messageHandlers[roomId]) {
      this.messageHandlers[roomId] = new MessageTransferHandler(roomId, this.wsHandler, this.notifier, this.store, this.messageHelper);
    }

    return this.messageHandlers[roomId];
  }

  public startCall(roomId: number) {
    this.getCallHandler(roomId).offerCall();
  }

  public answerCall(connId: string) {
    sub.notify({action: 'answerCall', handler: Subscription.getTransferId(connId)});
  }

  public declineCall(connId: string) {
    sub.notify({action: 'declineCall', handler: Subscription.getTransferId(connId)});
  }

  public videoAnswerCall(connId: string) {
    sub.notify({action: 'videoAnswerCall', handler: Subscription.getTransferId(connId)});
  }

  public hangCall(roomId: number) {
    this.callHandlers[roomId].hangCall();
  }

  public updateConnection(roomId: number) {
    this.callHandlers[roomId].updateConnection();
  }

  public setCanvas(roomId: number, canvas: HTMLCanvasElement) {
    this.getCallHandler(roomId).setCanvasElement(canvas);
  }

  public toggleDevice(roomId: number, videoType: VideoType) {
    this.callHandlers[roomId].toggleDevice(videoType);
  }

  public logout(m: LogoutMessage) {
    for (const k in this.callHandlers) {
      this.callHandlers[k].hangCall();
    }
    for (const k in this.messageHandlers) {
      this.messageHandlers[k].destroyThisTransferHandler();
    }

  }

  public offerFile(message: OfferFile): void {
    const limitExceeded = message.content.size > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem;
    const payload: ReceivingFile = {
      roomId: message.roomId,
      opponentWsId: message.opponentWsId,
      anchor: null,
      status: limitExceeded ? FileTransferStatus.ERROR : FileTransferStatus.NOT_DECIDED_YET,
      userId: message.userId,
      error: limitExceeded ? `Your browser doesn't support receiving files over ${bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)}` : null,
      connId: message.connId,
      fileName: message.content.name,
      time: this.wsHandler.convertServerTimeToPC(message.time),
      upload: {
        uploaded: 0,
        total: message.content.size
      }
    };
    this.notifier.showNotification(this.store.allUsersDict[message.userId].user, {
      body: `Sends file ${message.content.name}`,
      requireInteraction: true,
      icon: <string>faviconUrl,
      replaced: 1
    });
    this.store.addReceivingFile(payload);
    this.wsHandler.replyFile(message.connId, browserVersion);
    if (!limitExceeded) {
      new FileReceiverPeerConnection(message.roomId, message.connId, message.opponentWsId, this.wsHandler, this.store, message.content.size);
    }
  }


}
