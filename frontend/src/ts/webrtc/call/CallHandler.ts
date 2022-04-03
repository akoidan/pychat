import {
  browserVersion,
  isChrome,
  isMobile,
} from "@/ts/utils/runtimeConsts";
import {sub} from "@/ts/instances/subInstance";
import Subscription from "@/ts/classes/Subscription";
import type {
  CallsInfoModel,
  IncomingCallModel,
} from "@/ts/types/model";
import type {
  BooleanIdentifier,
  JsAudioAnalyzer,
  MediaIdentifier,
  NumberIdentifier,
  SetDevices,
} from "@/ts/types/types";
import {VideoType} from "@/ts/types/types";
import {
  CHROME_EXTENSION_ID,
  CHROME_EXTENSION_URL,
} from "@/ts/utils/consts";
import {
  extractError,
  getChromeVersion,
} from "@/ts/utils/pureFunctions";
import {
  createMicrophoneLevelVoice,
  getAverageAudioLevel,
  removeAudioProcesssor,
} from "@/ts/utils/audioprocc";
import CallSenderPeerConnection from "@/ts/webrtc/call/CallSenderPeerConnection";
import CallReceiverPeerConnection from "@/ts/webrtc/call/CallReceiverPeerConnection";
import type {
  CallStatus,
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";

import type {
  AcceptCallMessage,
  OfferCall,
  ReplyCallMessage,
} from "@/ts/types/messages/wsInMessages";
import type {
  ChangeStreamMessage,
  CheckTransferDestroy,
  ConnectToRemoteMessage,
  DestroyPeerConnectionMessage,
  RouterNavigateMessage,
} from "@/ts/types/messages/innerMessages";
import {FileAndCallTransfer} from "@/ts/webrtc/FileAndCallTransfer";
import {stopVideo} from "@/ts/utils/htmlApi";


export default class CallHandler extends FileAndCallTransfer {
  protected readonly handlers: HandlerTypes<keyof CallHandler, "webrtcTransfer:*"> = {
    answerCall: this.answerCall,
    videoAnswerCall: this.videoAnswerCall,
    declineCall: this.declineCall,
    replyCall: <HandlerType<"replyCall", "webrtcTransfer:*">> this.replyCall,
    acceptCall: <HandlerType<"acceptCall", "webrtcTransfer:*">> this.acceptCall,
    checkTransferDestroy: <HandlerType<"checkTransferDestroy", "webrtcTransfer:*">> this.checkTransferDestroy,
  };

  private canvas: HTMLCanvasElement | null = null;

  private localStream: MediaStream | null = null;

  private audioProcessor: JsAudioAnalyzer | null = null;

  private callStatus: CallStatus = "not_inited";

  private acceptedPeers: string[] = [];

  private get callInfo(): CallsInfoModel {
    return this.store.roomsDict[this.roomId].callInfo;
  }

  public checkTransferDestroy(payload: CheckTransferDestroy) {
    this.removeOpponent(payload.wsOpponentId);
    super.checkTransferDestroy(payload);
  }

  public inflateDevices(devices: MediaDeviceInfo[]): void {
    let c: number = 0,
      k: number, n: number;
    const microphones: Record<string, string> = {};
    const speakers: Record<string, string> = {};
    const webcams: Record<string, string> = {};
    const payload: SetDevices = {
      microphones,
      webcams,
      speakers,
      roomId: this.roomId,
    };
    if (devices) {
      devices.forEach((device: MediaDeviceInfo) => {
        switch (device.kind) {
          case "audioinput":
            microphones[device.deviceId] = device.label || `Microphone ${++n}`;
            break;
          case "audiooutput":
            speakers[device.deviceId] = device.label || `Speaker ${++k}`;
            break;
          case "videoinput":
            webcams[device.deviceId] = device.label || `Camera ${++c}`;
        }
      });
    }
    this.store.setDevices(payload);
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }

  public acceptCall(message: AcceptCallMessage) {
    if (this.callStatus !== "received_offer") { // If we're call initiator
      if (!this.connectionId) {
        throw Error("Conn is is null");
      }
      const payload: ConnectToRemoteMessage = {
        action: "connectToRemote",
        handler: Subscription.getPeerConnectionId(this.connectionId, message.opponentWsId),
        stream: this.localStream,
      };
      sub.notify(payload);
    } else {
      this.acceptedPeers.push(message.opponentWsId);
    }
  }

  public async getDesktopShareFromExtension(): Promise<string> {
    if (!isChrome) {
      throw new Error("ScreenCast feature is only available from chrome atm");
    } else if (isMobile) {
      throw new Error("ScreenCast is not available for mobile phones yet");
    } else {
      await this.pingExtension();
      this.logger.log("Ping to extension succeeded")();
      const response = await new Promise<{streamId: string; data: string}>((resolve, reject) => {
        chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {type: "PYCHAT_SCREEN_SHARE_REQUEST"}, resolve);
      });
      if (response && response.data === "success") {
        this.logger.log("Getting desktop share succeeded")();

        return response.streamId;
      }
      throw new Error("Failed to capture desktop stream");
    }
  }

  public async captureInput(): Promise<MediaStream | null> {
    this.logger.debug("capturing input")();

    /*
     * Start
     * we can't await promise one by one
     * because 2nd promise would be called after some period of time
     * which would destroy user gesture Event.
     * and browsers like safari won't let capture userMedia w/o existing user gesture
     */
    const micPromise = this.captureMic();
    const shareScreenPromise = this.captureScreenShare();
    const painterPromise = this.capturePainterShare();
    // End
    const streams: (MediaStream | null)[] = await Promise.all([micPromise, shareScreenPromise, painterPromise]);
    return this.combineStreams(...streams);
  }

  public processAudio(audioProc: JsAudioAnalyzer) {
    return () => {
      if (!this.callInfo.showMic) {
        return;
      }
      if (audioProc.volumeValuesCount < 101) {
        audioProc.prevVolumeValues += getAverageAudioLevel(audioProc);
        audioProc.volumeValuesCount++;
        if (audioProc.volumeValuesCount === 100 && audioProc.prevVolumeValues === 0) {
          let url = isChrome ? "setting in chrome://settings/content" : "your browser settings";
          url += navigator.platform.includes("Linux")
            ? ". Open pavucontrol for more info"
            : " . Right click on volume icon in system tray -> record devices -> input -> microphone";
          this.store.growlError(`Unable to capture input from microphone. Check your microphone connection or ${url}`);
        }
      }
      const payload: NumberIdentifier = {
        id: this.roomId,
        state: Math.sqrt(getAverageAudioLevel(audioProc)),
      };
      this.store.setCurrentMicLevel(payload);
    };
  }

  setCanvasElement(canvas: HTMLCanvasElement) {
    this.logger.debug("Setting canvas to {}", canvas)();
    this.canvas = canvas;
  }

  public async toggleDevice(videoType: VideoType) {
    const track = this.getTrack(videoType);
    if (track && track.readyState === "live") {
      this.logger.log("toggleDevice")();
      let state = false;
      if (videoType === VideoType.AUDIO) {
        state = this.callInfo.showMic;
      } else if (videoType === VideoType.SHARE) {
        state = this.callInfo.shareScreen;
      } else if (videoType === VideoType.VIDEO) {
        state = this.callInfo.showVideo;
      } else if (videoType === VideoType.PAINT) {
        state = this.callInfo.sharePaint;
      }
      track.enabled = state;
    } else {
      await this.updateConnection();
    }
  }

  public async updateConnection() {
    this.logger.log("updateConnection")();
    let stream: MediaStream | null = null;

    /*
     * TODO I removed this if below because otherwise if we created a connection w/o stream (no audio/ web/ share screen) we won't be able to add it in future
     * find out why this was necessary
     * if (this.localStream?.active) {
     */
    try {
      stream = await this.captureInput();
      this.stopLocalStream();
      this.attachLocalStream(stream);
      const message: ChangeStreamMessage = {
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        action: "streamChanged",
        allowZeroSubscribers: true,
        newStream: stream!,
      };
      sub.notify(message);
    } catch (e: any) {
      this.handleStream(e, stream);
    }
    // }
  }

  public getTrack(kind: VideoType) { // TODO
    let track = null;
    let tracks = [];
    if (this.localStream) {
      if (kind === VideoType.VIDEO || kind === VideoType.SHARE || kind === VideoType.PAINT) {
        tracks = this.localStream.getVideoTracks();
      } else if (kind === VideoType.AUDIO) {
        tracks = this.localStream.getAudioTracks();
      } else {
        throw Error("invalid track name");
      }
      if (tracks.length > 0) {
        const {isShare} = tracks[0];
        const {isCanvas} = tracks[0];
        if (isShare && kind === VideoType.SHARE) {
          track = tracks[0];
        } if (isCanvas && kind === VideoType.PAINT) {
          track = tracks[0];
        } else if (!isShare && !isCanvas && kind === VideoType.VIDEO) {
          track = tracks[0];
        } else if (kind === VideoType.AUDIO) {
          track = tracks[0];
        }
      }
    }

    return track;
  }

  /*
   * SetAudio(value) {
   *   let audioTrack = this.getTrack('audio');
   *   if (!audioTrack) {
   *     let payload: BooleanIdentifier = {
   *       id: this.roomId,
   *       state: false,
   *     };
   *     this.store.setMicToState(payload);
   *   }
   * }
   */

  public setCallIconsState() {

    /*
     * If (this.callInfo.showMic) {
     *   let audioTrack = this.getTrack('audio');
     *   if (!audioTrack) {
     *     let payload: BooleanIdentifier = {
     *       id: this.roomId,
     *       state: false,
     *     }
     *     this.store.setMicToState(payload);
     *   }
     * }
     * let videoTrack = this.getTrack('video');
     * if (this.)
     * this.setVideo(videoTrack && videoTrack.enabled);
     * this.setAudio(audioTrack && audioTrack.enabled);
     * this.setDesktopCapture(this.getTrack('share') != null);
     * this.autoSetLocalVideoVisibility();
     */
  }

  public async offerCall() {
    let stream: MediaStream | null = null;
    try {
      stream = await this.captureInput();
      this.logger.log("got local stream {}", stream)();
      if (stream) {
        this.attachLocalStream(stream);
      }
      const payload: BooleanIdentifier = {
        state: true,
        id: this.roomId,
      };
      this.setCallStatus("sent_offer");
      this.store.setCallActiveToState(payload);
      const e = await this.wsHandler.offerCall(this.roomId, browserVersion);
      this.setConnectionId(e.connId);
    } catch (e: any) {
      this.handleStream(e, stream);
    }
  }

  public createCallPeerConnection({opponentWsId, userId}: {opponentWsId: string; userId: number}) {
    if (sub.getNumberOfSubscribers(Subscription.getPeerConnectionId(this.connectionId!, opponentWsId)) !== 0) {
      this.logger.warn(`Peer connection ${opponentWsId} won't be created as it's already exists`)();
      return;
    }
    if (opponentWsId > this.wsHandler.getWsConnectionId()) {
      new CallSenderPeerConnection(this.roomId, this.connectionId!, opponentWsId, userId, this.wsHandler, this.store);
    } else {
      new CallReceiverPeerConnection(this.roomId, this.connectionId!, opponentWsId, userId, this.wsHandler, this.store);
    }
  }

  protected setConnectionId(connId: string | null) {
    if (this.connectionId) {
      if (!connId) {
        sub.unsubscribe(Subscription.getTransferId(this.connectionId), this);
      } else {
        this.logger.error("Received new connectionId while old one stil exists")();
      }
    }
    if (this.connectionId !== connId && connId) {
      sub.subscribe(Subscription.getTransferId(connId), this);
    }
    super.setConnectionId(connId);
  }

  public addOpponent(connId: string, userId: number, opponentWsId: string): void {
    this.logger.debug(`Adding opponent ${connId} ${userId} ${opponentWsId}`)();
    this.setConnectionId(connId);
    this.acceptedPeers.push(opponentWsId);
    this.createCallPeerConnection({opponentWsId,
      userId});
    this.store.setCallActiveButNotJoinedYet({state: true,
      id: this.roomId});
  }

  public removeUserOpponent(userId: number): void {
    this.acceptedPeers = this.acceptedPeers.filter((wsId) => parseInt(wsId.split(":")[0], 10) != userId);
  }

  public removeOpponent(opponentWsId: string): void {
    const index = this.acceptedPeers.indexOf(opponentWsId);
    if (index >= 0) {
      this.acceptedPeers.splice(index);
    }
    if (this.acceptedPeers.length === 0) {
      this.store.setCallActiveButNotJoinedYet({state: false,
        id: this.roomId});
    }
  }

  public replyCall(message: ReplyCallMessage) {
    this.createCallPeerConnection(message);
  }

  public initAndDisplayOffer(message: OfferCall) {
    this.setCallStatus("received_offer");
    if (this.connectionId) {
      this.logger.error("Old connId still exists {}", this.connectionId)();
    }
    this.setConnectionId(message.connId);
    this.logger.log("CallHandler initialized")();
    this.wsHandler.replyCall(message.connId, browserVersion);
    const payload2: IncomingCallModel = {
      connId: message.connId,
      roomId: message.roomId,
      userId: message.userId,
    };
    this.acceptedPeers.push(message.opponentWsId);
    this.store.setIncomingCall(payload2);
    this.createCallPeerConnection(message);
  }

  public answerCall() {
    this.doAnswer(false);
  }

  public async doAnswer(withVideo: boolean) {
    this.store.setIncomingCall(null);
    this.store.setCallActiveToState({
      id: this.roomId,
      state: true,
    });
    this.store.setVideoToState({
      type: "webcam",
      id: this.roomId,
      state: withVideo,
    });
    this.store.setMicToState({
      id: this.roomId,
      state: true,
    });
    this.setCallStatus("accepted");
    const stream = await this.captureInput();
    this.attachLocalStream(stream);
    this.wsHandler.acceptCall(this.connectionId!);
    this.connectToRemote();
    const message1: RouterNavigateMessage = {
      handler: "router",
      action: "navigate",
      to: `/chat/${this.roomId}`,
    };
    sub.notify(message1);
  }

  public async joinCall() {
    this.store.setCallActiveButNotJoinedYet({
      id: this.roomId,
      state: false,
    });
    this.store.setCallActiveToState({
      id: this.roomId,
      state: true,
    });
    this.setCallStatus("accepted");
    const stream = await this.captureInput();
    this.attachLocalStream(stream);
    this.wsHandler.joinCall(this.connectionId!);
    this.connectToRemote();
  }

  private connectToRemote() {
    this.acceptedPeers.forEach((e) => {
      const message: ConnectToRemoteMessage = {
        action: "connectToRemote",
        stream: this.localStream,
        handler: Subscription.getPeerConnectionId(this.connectionId!, e),
      };
      sub.notify(message);
    });
  }

  public videoAnswerCall() {
    this.doAnswer(true);
  }

  public destroyAudioProcessor() {
    if (this.audioProcessor) {
      removeAudioProcesssor(this.audioProcessor);
    }
  }

  public stopLocalStream() {
    this.destroyAudioProcessor();
    stopVideo(this.localStream);
  }

  public onDestroy() {
    this.stopLocalStream();
    const payload2: MediaIdentifier = {
      id: this.roomId,
      media: null,
    };
    this.store.setLocalStreamSrc(payload2);
    this.setConnectionId(null);
    const payload: BooleanIdentifier = {
      state: false,
      id: this.roomId,
    };
    this.store.setCallActiveToState(payload);
    this.store.setCallActiveButNotJoinedYet({
      id: this.roomId,
      state: false,
    });
    this.acceptedPeers.length = 0; // = []
  }

  public declineCall() {
    this.store.setIncomingCall(null);
    this.wsHandler.destroyCallConnection(this.connectionId!, "decline");
    this.onDestroy();
  }

  public hangCall() {
    this.logger.debug("on hangCall called")();
    if (this.connectionId) {
      this.wsHandler.destroyCallConnection(this.connectionId, "hangup");
    } else {
      this.logger.warn("Current call doesnt have conenctionId yet, skipping hangup")();
    }
    const hadConnections = this.connectionId && sub.getNumberOfSubscribers(Subscription.allPeerConnectionsForTransfer(this.connectionId)) > 0;
    if (hadConnections) {
      if (!this.connectionId) {
        this.logger.error("Can't close connections since it's null")();
        return;
      }
      const message: DestroyPeerConnectionMessage = {
        action: "destroy",
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId),
        allowZeroSubscribers: true,
      };
      sub.notify(message);
    } else {
      this.onDestroy();
    }
  }

  private async pingExtension(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const error = {rawError: `To share your screen you need chrome extension.<b> <a href="${CHROME_EXTENSION_URL}" target="_blank">Click to install</a></b>`};
      if (chrome.runtime && chrome.runtime.sendMessage) {
        let triggered = false;
        const timedCB = setTimeout(() => {
          !triggered && reject(error);
          triggered = true;
        }, 500);

        chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
          type: "PYCHAT_SCREEN_SHARE_PING",
        }, (response) => {
          if (triggered) {
            this.logger.error("extension responded after timeout")();
          } else if (response && response.data === "success") {
            clearTimeout(timedCB);
            resolve();
          } else {
            clearTimeout(timedCB);
            reject(response && response.data || error);
          }
        });
      } else {
        reject(error);
      }
    });
  }

  private async captureMic(): Promise<MediaStream | null> {
    let stream: MediaStream | null = null;
    const {showMic} = this.callInfo;
    const {showVideo} = this.callInfo;
    if (showMic || showVideo) {
      // Inflate devices b4 capture, in this case we can disable video if user enabled it but has no webcam
      if (navigator.mediaDevices.enumerateDevices) {
        const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
        this.inflateDevices(devices);
        if (showMic !== this.callInfo.showMic) {
          this.store.growlError("Unable to capture audio, because no microphones found");
        }
        if (showVideo !== this.callInfo.showVideo) {
          this.store.growlError("Unable to capture video, because no webcam found");
        }
        if (!this.callInfo.showMic && !this.callInfo.showVideo) {
          return null; // Inflate devices could have set them to null if they are absent
        }
      }
      let audio: any = this.callInfo.showMic;
      if (this.callInfo.currentMic && audio) {
        audio = {deviceId: this.callInfo.currentMic};
      }
      let video: any = this.callInfo.showVideo; // Convert null to bolean, if we pass null to getUserMedia it tries to capture
      if (this.callInfo.currentWebcam && video) {
        video = {deviceId: this.callInfo.currentWebcam};
      }
      this.logger.debug("navigator.mediaDevices.getUserMedia({audio, video})")();
      stream = await navigator.mediaDevices.getUserMedia({audio,
        video});
      this.logger.debug("navigator.mediaDevices.getUserMedia({audio, video})")();
      if (!stream) {
        throw new Error("Unable to capture stream");
      }
    }
    return stream;
  }

  private async capturePainterShare(): Promise<MediaStream | null> {
    if (this.callInfo.sharePaint) {

      /*
       * TODO install definitely type
       * @ts-expect-error
       */
      if (!this.canvas?.captureStream) {
        throw Error("Current browser doesn't support canvas stream");
      }
      const stream = this.canvas.captureStream();
      const tracks: any[] = stream.getVideoTracks();
      if (!(tracks && tracks.length > 0)) {
        throw Error("No video tracks from captured from canvas");
      }
      tracks[0].isCanvas = true;
      return stream;
    }
    return null;
  }

  private async captureScreenShare(): Promise<MediaStream | null> {
    let stream: MediaStream | null = null;
    if (this.callInfo.shareScreen) {
      const chromeVersion = getChromeVersion();
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        this.logger.debug("Getting shareScreen from  navigator.getDisplayMedia")();
        stream = await navigator.mediaDevices.getDisplayMedia({video: true});
      } else {
        if (chromeVersion && chromeVersion > 70) {
          this.store.growlInfo("You can now use chrome://flags/#enable-experimental-web-platform-features to share your screen");
        }
        const streamId: string = await this.getDesktopShareFromExtension();
        this.logger.debug("Resolving userMedia from dekstopShare")();
        stream = await navigator.mediaDevices.getUserMedia(<MediaStreamConstraints><unknown>{ // TODO update ts to support this
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: streamId,
              maxWidth: window.screen.width,
              maxHeight: window.screen.height,
            },
          },
        });
      }
      const tracks: any[] = stream.getVideoTracks();
      if (!(tracks && tracks.length > 0)) {
        throw Error("No video tracks from captured screen");
      }
      tracks[0].isShare = true;
    }
    return stream;
  }

  private combineStreams(...streams: (MediaStream | null)[]): MediaStream | null {
    let stream: MediaStream | null = null;
    streams.forEach((s) => {
      if (s) {
        if (!stream) {
          stream = s;
        } else {
          for (const t of s.getTracks()) {
            stream.addTrack(t);
          }
        }
      }
    });
    return stream;
  }

  private handleStream(e: string, endStream: MediaStream | null) {
    const what = [];
    if (this.callInfo.showMic) {
      what.push("audio");
    }
    if (this.callInfo.showVideo) {
      what.push("video");
    }
    if (this.callInfo.shareScreen) {
      what.push("screenshare");
    }
    const message = `<span>Failed to capture ${what.join(", ")} source</span>, because ${extractError(e)}`;
    stopVideo(endStream);
    this.store.growlErrorRaw(message);
    this.logger.error("onFailedCaptureSource {}", e)();
  }

  private attachLocalStream(stream: MediaStream | null) {
    this.logger.log("Local stream has been attached");
    if (stream) {
      this.localStream = stream;
      this.audioProcessor = createMicrophoneLevelVoice(stream, this.processAudio.bind(this));
      const payload: MediaIdentifier = {
        id: this.roomId,
        media: stream,
      };
      this.store.setLocalStreamSrc(payload);
    }
    this.setCallIconsState();
  }

  private setCallStatus(status: CallStatus) {
    this.logger.log("Setting call status to {}", status)();
    this.callStatus = status;
  }
}
