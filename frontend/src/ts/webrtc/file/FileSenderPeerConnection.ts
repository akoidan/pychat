import type {
  AddSendingFileTransfer,
  SetSendingFileStatus,
  SetSendingFileUploaded,
} from "@/ts/types/types";
import type {SendingFileTransfer} from "@/ts/types/model";
import {FileTransferStatus} from "@/ts/types/model";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import {
  bytesToSize,
  getDay,
} from "@/ts/utils/pureFunctions";
import {
  READ_CHUNK_SIZE,
  SEND_CHUNK_SIZE,
} from "@/ts/utils/consts";
import FilePeerConnection from "@/ts/webrtc/file/FilePeerConnection";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  AcceptFileMessage,
  DestroyFileConnectionMessage,
} from "@/ts/types/messages/wsInMessages";
import type Subscription from "@/ts/classes/Subscription";

export default class FileSenderPeerConnection extends FilePeerConnection {
  protected readonly handlers: HandlerTypes<keyof FileSenderPeerConnection, "peerConnection:*"> = {
    destroyFileConnection: <HandlerType<"destroyFileConnection", "peerConnection:*">> this.destroyFileConnection,
    acceptFile: <HandlerType<"acceptFile", "peerConnection:*">> this.acceptFile,
    sendRtcData: <HandlerType<"sendRtcData", "peerConnection:*">> this.sendRtcData,
    declineSending: <HandlerType<"declineSending", "peerConnection:*">> this.declineSending,
  };

  private readonly file: File;

  private reader: FileReader | null = null;

  private offset: number = 0;

  private lastPrinted: number = 0;

  private sendDataTimeout: number = 0;

  private trackTimeout: number = 0;

  public constructor(roomId: number, connId: string, opponentWsId: string, wsHandler: WsHandler, store: DefaultStore, file: File, userId: number, sub: Subscription) {
    super(roomId, connId, opponentWsId, wsHandler, store, sub);
    this.file = file;
    const asft: AddSendingFileTransfer = {
      connId,
      transferId: opponentWsId,
      roomId,
      transfer: {
        status: FileTransferStatus.NOT_DECIDED_YET,
        error: null,
        userId,
        upload: {
          total: this.file.size,
          uploaded: 0,
        },
      },
    };
    this.store.addSendingFileTransfer(asft);
  }

  get sendingFileTransfer(): SendingFileTransfer {
    return this.store.roomsDict[this.roomId].sendingFiles[this.connectionId].transfers[this.opponentWsId];
  }

  public oniceconnectionstatechange() {
    super.oniceconnectionstatechange();
    if (this.pc!.iceConnectionState === "disconnected" ||
      this.pc!.iceConnectionState === "failed" ||
      this.pc!.iceConnectionState === "closed") {
      if (this.sendDataTimeout) {
        this.logger.log("clearing sendDataTimeout {}", this.sendDataTimeout)();
        window.clearTimeout(this.sendDataTimeout); // Should this be in destroy?
      }
      if (this.trackTimeout) {
        this.logger.log("clearing trackTimeout {}", this.trackTimeout)();
        window.clearTimeout(this.trackTimeout);
      }
    }
  }

  public acceptFile(message: AcceptFileMessage) {
    this.offset = message.content.received;
    this.createPeerConnection();
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.IN_PROGRESS,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
    this.setTranseferdAmount(message.content.received);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel("sendDataChannel", {reliable: false});
      this.sendChannel.onopen = this.onreceiveChannelOpen.bind(this);
      this.logger.log("Created send data channel.")();
    } catch (e: any) {
      const error = `Failed to create data channel because ${e.message || e}`;
      this.commitErrorIntoStore(error);
      this.logger.error("acceptFile {}", e)();

      return;
    }
    this.createOffer();
    this.wsHandler.retry(this.connectionId, this.opponentWsId);
  }

  public onreceiveChannelOpen() {
    this.logger.log("Channel is open, slicing file: {} {} {} {}", this.file.name, bytesToSize(this.file.size), this.file.type, getDay(new Date(this.file.lastModified)))();
    this.reader = new FileReader();
    this.reader.onload = this.onFileReaderLoad.bind(this);
    this.sendCurrentSlice();
    this.lastPrinted = 0;
  }

  public sendCurrentSlice() {
    const currentSlice = this.file.slice(this.offset, this.offset + READ_CHUNK_SIZE);
    this.reader!.readAsArrayBuffer(currentSlice);
  }

  public setTranseferdAmount(value: number) {
    const ssfu: SetSendingFileUploaded = {
      roomId: this.roomId,
      uploaded: value,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileUploaded(ssfu);
  }

  public onFileReaderLoad(e: ProgressEvent<FileReader>) {
    if ((<ArrayBuffer>e.target!.result).byteLength > 0) { // TODO if it's an str?
      this.sendData(<ArrayBuffer>e.target!.result, 0, () => {
        this.offset += (<ArrayBuffer>e.target!.result).byteLength;
        this.sendCurrentSlice();
      });
    } else {
      const trackTransfer = () => {
        this.trackTimeout = 0;
        this.logger.debug("trackTransfer")();
        if (this.sendChannel!.readyState === "open" && this.sendChannel!.bufferedAmount > 0) {
          this.setTranseferdAmount(this.offset - this.sendChannel!.bufferedAmount);
          this.trackTimeout = window.setTimeout(trackTransfer, 500);
        } else if (this.sendChannel!.bufferedAmount === 0) {
          this.setTranseferdAmount(this.offset);
        }
      };
      trackTransfer();
      this.logger.log("Exiting, offset is {} now, fs: {}", this.offset, this.file.size)();
    }
  }

  public destroyFileConnection(message: DestroyFileConnectionMessage) {
    let isError = false;
    let status;
    if (message.content === "decline") {
      status = FileTransferStatus.DECLINED_BY_OPPONENT;
      this.unsubscribeAndRemoveFromParent();
    } else if (message.content === "success") {
      status = FileTransferStatus.FINISHED;
      this.unsubscribeAndRemoveFromParent();
    } else {
      status = FileTransferStatus.ERROR;
      isError = true;
    }
    const payload: SetSendingFileStatus = {
      transfer: this.opponentWsId,
      connId: this.connectionId,
      error: isError ? message.content : null,
      roomId: this.roomId,
      status,
    };
    this.store.setSendingFileStatus(payload);
  }

  public declineSending() {
    this.unsubscribeAndRemoveFromParent();
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.DECLINED_BY_YOU,
      roomId: this.roomId,
      error: null,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
    this.wsHandler.destroyPeerFileConnection(this.connectionId, "decline", this.opponentWsId);
  }

  commitErrorIntoStore(error: string, onlyIfNotFinished: boolean = false): void {
    if (onlyIfNotFinished && this.sendingFileTransfer.status === FileTransferStatus.FINISHED) {
      return;
    }
    const ssfs: SetSendingFileStatus = {
      status: FileTransferStatus.ERROR,
      roomId: this.roomId,
      error,
      connId: this.connectionId,
      transfer: this.opponentWsId,
    };
    this.store.setSendingFileStatus(ssfs);
  }

  private sendData(data: ArrayBuffer, offset: number, cb: () => void): void {
    this.sendDataTimeout = 0;
    try {
      if (this.sendChannel!.readyState === "open") {
        if (this.sendChannel!.bufferedAmount > 10000000) { // Prevent chrome buffer overfill
          // If it happens chrome will just close the datachannel
          const now = Date.now();
          if (now - this.lastPrinted > 1000) {
            this.lastPrinted = now;
            this.logger.debug(
              "Buffer overflow by {}, waiting to flush...",
              bytesToSize(this.sendChannel!.bufferedAmount),
            )();
          }
          this.sendDataTimeout = setTimeout(this.sendData.bind(this), 100, data, offset, cb) as any;

          return;
        }
        const buffer = data.slice(offset, offset + SEND_CHUNK_SIZE);
        this.sendChannel!.send(buffer);
        const chunkOffset = offset + buffer.byteLength;
        this.setTranseferdAmount(this.offset + chunkOffset - this.sendChannel!.bufferedAmount);
        if (data.byteLength > chunkOffset) {
          this.sendData(data, chunkOffset, cb);
        } else {
          cb();
        }
      } else {
        throw Error(`Can't write data into ${this.sendChannel!.readyState} channel`);
      }
    } catch (error: any) {
      this.commitErrorIntoStore(`Internal error: ${error?.message}`);
      this.unsubscribeAndRemoveFromParent();
      this.logger.error("sendData {}", error)();
    }
  }
}
