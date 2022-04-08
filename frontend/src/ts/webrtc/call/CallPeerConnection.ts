import {
  createMicrophoneLevelVoice,
  getAverageAudioLevel,
  removeAudioProcesssor,
} from "@/ts/utils/audioprocc";
import AbstractPeerConnection from "@/ts/webrtc/AbstractPeerConnection";
import type {
  JsAudioAnalyzer,
  SetCallOpponent,
  SetOpponentAnchor,
  SetOpponentVoice,
} from "@/ts/types/types";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {
  ChangeStreamMessage,
  ConnectToRemoteMessage,
  DestroyPeerConnectionMessage,
} from "@/ts/types/messages/innerMessages";
import type {DestroyCallConnection} from "@/ts/types/messages/wsInMessages";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import {
  getStreamLog,
  getTrackLog,
} from "@/ts/utils/pureFunctions";
import type {
  CallInfoModel,
  RoomModel,
} from "@/ts/types/model";
import {stopVideo} from "@/ts/utils/htmlApi";
import type Subscription from "@/ts/classes/Subscription";

export default abstract class CallPeerConnection extends AbstractPeerConnection {
  protected readonly handlers: HandlerTypes<keyof CallPeerConnection, "peerConnection:*"> = {
    destroy: <HandlerType<"destroy", "peerConnection:*">> this.destroy,
    streamChanged: <HandlerType<"streamChanged", "peerConnection:*">> this.streamChanged,
    connectToRemote: <HandlerType<"connectToRemote", "peerConnection:*">> this.connectToRemote,
    sendRtcData: <HandlerType<"sendRtcData", "peerConnection:*">> this.sendRtcData,
    destroyCallConnection: <HandlerType<"destroyCallConnection", "peerConnection:*">> this.destroyCallConnection,
  };

  private audioProcessor: any;

  // Ontrack can be triggered multiple time, so call this in order to prevent updaing store multiple time
  private remoteStream: MediaStream | null = null;

  private localStream: MediaStream | null = null;

  private readonly streamTrackApi: "stream" | "track" = "track";

  public constructor(
    roomId: number,
    connId: string,
    opponentWsId: string,
    userId: number,
    wsHandler: WsHandler,
    store: DefaultStore,
    sub: Subscription,
  ) {
    super(roomId, connId, opponentWsId, wsHandler, store, sub);
    // @ts-expect-error
    window.callPeerConnection = this;
    const payload: SetCallOpponent = {
      opponentWsId: this.opponentWsId,
      roomId: this.roomId,
      callInfoModel: {
        connected: false,
        mediaStreamLink: null,
        userId,
        opponentCurrentVoice: 0,
      },
    };
    this.connectedToRemote = false;

    /*
     * https://stackoverflow.com/a/45567799/3872976
     * https://www.w3.org/TR/webrtc/#webidl-1352513424
     * otherwise response with video won't be available
     */
    this.sdpConstraints = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };
    this.store.setCallOpponent(payload);
  }

  protected _connectedToRemote: boolean = false;

  get connectedToRemote() {
    return this._connectedToRemote;
  }

  set connectedToRemote(v: boolean) {
    this._connectedToRemote = v;
    if (this.callInfo) {
      this.callInfo.connected = v;
    } else {
      // Opponent dropped
      this.logger.warn("Can't set connected to remote to {} because callInfo doesn't exists", v)();
    }
  }

  get callInfo(): CallInfoModel | null {
    return this.room?.callInfo?.calls[this.opponentWsId] ?? null;
  }

  get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }


  public connectToRemote(stream: ConnectToRemoteMessage) {
    this.logger.log("Connect to remote")();
    this.store.roomsDict[this.roomId].callInfo.calls[this.opponentWsId].connected = true;
    this.connectedToRemote = true;
    this.createPeerConnection(stream);
  }

  public oniceconnectionstatechange() {
    this.logger.log(`iceconnectionstate has been changed to ${this.pc!.iceConnectionState}`)();
    if (this.pc!.iceConnectionState === "disconnected" ||
      this.pc!.iceConnectionState === "failed" ||
      this.pc!.iceConnectionState === "closed") {
      this.connectedToRemote = false;

      /*
       * This.logger.log('disconnecting...')();
       * TODO, nope, if state has been changed to disconnected we should NOT close a connection
       * since on chaning streams connection is also dropping and then goes by the chain 'checking' 'connected' 'completed'
       * at least this is on safari, on chrome it usually doesn't go to disconnected,
       * this.onDestroy('Connection has been lost');
       */
    } else {
      this.connectedToRemote = true;
    }
  }

  public createPeerConnection(event: ConnectToRemoteMessage) {
    super.createPeerConnection();

    if (this.streamTrackApi === "stream") {
      this.pc!.onaddstream = (event: any) => {
        this.logger.log("onaddstream {}", getStreamLog(event.stream))();
        if (event.stream) {
          this.addStream(event.stream);
        } else {
          this.logger.error("Got null stream")();
        }
      };
    } else {
      // Onaddstream property has been removed from the specification; you should now use RTCPeerConnection.ontrack to watch for track events instead.
      this.pc!.ontrack = (event: RTCTrackEvent) => {
        this.logger.log("ontrack {}", getStreamLog(event.streams[0]))();
        if (event.streams.length === 0) {
          this.logger.error("Oops, expected tracks to be attached at least to one stream")();
        } else if (event.streams.length > 1) {
          this.logger.error("Unexpected multiple streams. Should be exactly 1 stream and multiple tracks")();
        } else {
          this.addStream(event.streams[0]);
        }
      };
    }
    this.changeStreams(event.stream);
  }

  public streamChanged(payload: ChangeStreamMessage) {
    this.logger.log("onStreamChanged {}", payload)();
    if (this.pc) {
      this.changeStreams(payload.newStream);
      this.createOffer();
    }
  }

  public processAudio(audioProc: JsAudioAnalyzer) {
    return () => {
      const level = getAverageAudioLevel(audioProc); // 256 max
      let clasNu;
      if (level < 0.5) {
        clasNu = 0;
      } else if (level < 5) {
        clasNu = 1;
      } else if (level < 12) {
        clasNu = 2;
      } else if (level < 25) {
        clasNu = 3;
      } else if (level < 50) {
        clasNu = 4;
      } else if (level < 90) {
        clasNu = 5;
      } else if (level < 110) {
        clasNu = 6;
      } else if (level < 140) {
        clasNu = 7;
      } else if (level < 180) {
        clasNu = 8;
      } else {
        clasNu = 9;
      }

      const payload: SetOpponentVoice = {
        voice: clasNu,
        opponentWsId: this.opponentWsId,
        roomId: this.roomId,
      };
      try { // EAFP: Easier to ask for forgiveness than permission.
        this.store.setOpponentVoice(payload); // If call is deleted long ago but audioProcess stil exists
        // TODO find the spot that produces this situation and fix it there
      } catch (e) {
        this.logger.error("Error during setting opponent's voice {}", e)();
        removeAudioProcesssor(this.audioProcessor);
      }
    };
  }

  public destroy(message: DestroyPeerConnectionMessage) { // Called by transfer
    this.unsubscribeAndRemoveFromParent();
  }

  destroyCallConnection(m: DestroyCallConnection) { // Called by opponent devices via ws
    this.unsubscribeAndRemoveFromParent();
  }

  public unsubscribeAndRemoveFromParent() {

    /*
     * This seems to be redundant
     * if (this.streamTrackApi === 'stream') {
     *   if (this.localStream && this.pc) {
     *     this.pc!.removeStream(this.localStream);
     *   }
     *   this.localStream = null;
     * } else if (this.pc) {
     *   const senders = this.pc!.getSenders();
     *   for (let sender of senders) {
     *     this.logger.debug('Remove track from sender {}', sender)();
     *     this.pc!.removeTrack(sender);
     *   }
     * }
     */
    if (this.remoteStream) {
      stopVideo(this.remoteStream);
      this.remoteStream = null;
    }
    removeAudioProcesssor(this.audioProcessor);
    super.unsubscribeAndRemoveFromParent();
    const payload: SetCallOpponent = {
      opponentWsId: this.opponentWsId,
      roomId: this.roomId,
      callInfoModel: null,
    };
    this.store.setCallOpponent(payload);
  }

  private addStream(stream: MediaStream) {
    if (this.remoteStream !== stream) {
      this.remoteStream = stream;
      const payload: SetOpponentAnchor = {
        anchor: this.remoteStream, // R3d71 search bottom
        opponentWsId: this.opponentWsId,
        roomId: this.roomId,
      };
      this.store.setOpponentAnchor(payload);

      if (this.sendRtcDataQueue.length > 0) {
        this.logger.log("Connection accepted, consuming sendRtcDataQueue")();
        const queue = this.sendRtcDataQueue;
        this.sendRtcDataQueue = [];
        queue.forEach(async(message) => this.sendRtcData(message));
      }

      /*
       *
       * If (p) { //firefox video.play doesn't return promise
       *   // chrome returns promise, if it's on mobile devices video sound would be muted
       *   // coz it initialized from network instead of user gesture
       *   p.catch(Utils.clickToPlay(this.dom.remote))
       * }
       */
      removeAudioProcesssor(this.audioProcessor);
      this.audioProcessor = createMicrophoneLevelVoice(this.remoteStream, this.processAudio.bind(this));
    } else {
      this.logger.log("onstream has been called already for this stream. So skipping this cb")();
    }
  }

  private changeStreams(stream: MediaStream | null) {
    const prevStream = this.localStream;
    this.localStream = stream;
    if (this.streamTrackApi === "stream") {
      this.logger.log("Adding local stream {} to remote", getStreamLog(stream))();
      if (prevStream) {
        this.pc!.removeStream(prevStream);
      }
      this.pc!.addStream(stream!);
    } else {
      this.logger.log("Rewriting tracks to remote for stream {}", getStreamLog(stream))();
      const senders = this.pc!.getSenders();
      for (const sender of senders) {
        this.logger.debug("Remove track from sender {}", sender)();
        this.pc!.removeTrack(sender);
      }
      if (stream) {
        for (const track of stream.getTracks()) {

          /*
           * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack
           * check usage notes, if I don't specify a stream as a second arguments
           * onaddtracks in r3d71 would be w/o a stream and I would need to create a stream and assemble them manually
           */
          this.logger.debug("Adding track {} to sender, of stream {}", getTrackLog(track), getStreamLog(stream))();
          this.pc!.addTrack(track, stream);
        }
      }
    }
  }
}
