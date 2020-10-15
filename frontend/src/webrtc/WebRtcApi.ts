import loggerFactory from '@/utils/loggerFactory';
import {Logger} from 'lines-logger';
import {VideoType} from '@/types/types';
import {
  DefaultMessage,
  OfferCall,
  OfferFile,
  WebRtcSetConnectionIdMessage
} from '@/types/messages';
import WsHandler from '@/utils/WsHandler';
import {FileTransferStatus, ReceivingFile} from '@/types/model';
import FileSender from '@/webrtc/FileSender';
import NotifierHandler from '@/utils/NotificationHandler';
import {browserVersion} from '@/utils/singletons';
import MessageHandler, {HandlerType, HandlerTypes} from '@/utils/MesageHandler';
import {sub} from '@/utils/sub';
import {MAX_ACCEPT_FILE_SIZE_WO_FS_API} from '@/utils/consts';
import {requestFileSystem} from '@/utils/htmlApi';
import {bytesToSize} from '@/utils/utils';
import FileReceiverPeerConnection from '@/webrtc/FileReceiveerPeerConnection';
import Subscription from '@/utils/Subscription';
import CallHandler from '@/webrtc/CallHandler';
import faviconUrl from '@/assets/img/favicon.ico';
import {DefaultStore} from '@/utils/store';

export default class WebRtcApi extends MessageHandler {

  protected logger: Logger;

  protected readonly handlers: HandlerTypes  = {
    offerFile: <HandlerType>this.onofferFile,
    offerCall: <HandlerType>this.offerCall
  };

  private readonly wsHandler: WsHandler;
  private readonly store: DefaultStore;
  private readonly notifier: NotifierHandler;
  private readonly callHandlers: {[id: number]: CallHandler} = {};

  constructor(ws: WsHandler, store: DefaultStore, notifier: NotifierHandler) {
    super();
    sub.subscribe('webrtc', this);
    this.wsHandler = ws;
    this.notifier = notifier;
    this.logger = loggerFactory.getLogger('WEBRTC', 'color: #960055');
    this.store = store;
  }

  public offerCall(message: OfferCall) {
    this.getCallHandler(message.roomId).initAndDisplayOffer(message);
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

  public offerFile(file: File, channel: number) {
    if (file.size > 0) {
      this.wsHandler.offerFile(channel, browserVersion, file.name, file.size, (e: WebRtcSetConnectionIdMessage) => {
        if (e.connId) {
          new FileSender(channel, e.connId, this.wsHandler, this.notifier, this.store, file, e.time);
        }
      });
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

  public toggleDevice(roomId: number, videoType: VideoType) {
    this.callHandlers[roomId].toggleDevice(videoType);
  }

  public closeAllConnections() {
    for (const k in this.callHandlers) {
      this.callHandlers[k].hangCall();
    }
  }

  private onofferFile(message: OfferFile): void {
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
      time: message.time,
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
