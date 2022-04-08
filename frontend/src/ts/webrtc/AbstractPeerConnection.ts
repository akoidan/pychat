import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import {bytesToSize} from "@/ts/utils/pureFunctions";

import MessageHandler from "@/ts/message_handlers/MesageHandler";
import Subscription from "@/ts/classes/Subscription";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {HandlerName} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  CheckTransferDestroy,
  ConnectToRemoteMessage,
} from "@/ts/types/messages/innerMessages";
import type {SendRtcDataMessage} from "@/ts/types/messages/wsInMessages";
import {WEBRTC_RUNTIME_CONFIG} from "@/ts/utils/runtimeConsts";


export default abstract class AbstractPeerConnection extends MessageHandler {
  protected offerCreator: boolean = false;

  protected sendRtcDataQueue: SendRtcDataMessage[] = [];

  protected readonly opponentWsId: string;

  protected readonly connectionId: string;

  protected logger: Logger;

  protected pc: RTCPeerConnection | null = null;

  protected sdpConstraints: any;

  protected readonly wsHandler: WsHandler;

  protected readonly store: DefaultStore;

  protected readonly roomId: number;

  protected sendChannel: RTCDataChannel | null = null;

  protected readonly sub: Subscription;

  private readonly pc_constraints: unknown = {
    optional: [/* Firefox*/
      /* {DtlsSrtpKeyAgreement: true},*/
      {RtpDataChannels: false /* True*/},
    ],
  };

  public constructor(roomId: number, connectionId: string, opponentWsId: string, ws: WsHandler, store: DefaultStore, sub: Subscription) {
    super();
    this.roomId = roomId;
    this.connectionId = connectionId;
    this.opponentWsId = opponentWsId;
    this.sub = sub;
    this.sub.subscribe(Subscription.allPeerConnectionsForTransfer(connectionId), this);
    this.sub.subscribe(this.mySubscriberId, this);
    this.wsHandler = ws;
    this.store = store;
    this.logger = loggerFactory.getLoggerColor(`peer:${this.connectionId}:${this.opponentWsId}`, "#960055");
    this.logger.log("Created {}", this.constructor.name)();
  }

  abstract get connectedToRemote(): boolean;
  abstract set connectedToRemote(v: boolean);

  get mySubscriberId(): HandlerName {
    return Subscription.getPeerConnectionId(this.connectionId, this.opponentWsId);
  }

  public unsubscribeAndRemoveFromParent() {
    this.logger.log("Destroying {}", this.constructor.name)();
    if (this.sendChannel && this.sendChannel.readyState !== "closed") {
      this.logger.log("Closing channel from state {}", this.sendChannel.readyState)();
      this.sendChannel.close();
    } else {
      this.logger.log("No channels to close")();
    }
    if (this.pc && this.pc.signalingState !== "closed") {
      this.logger.log("Closing peer connection")();
      this.pc.close();
      this.pc = null;
    } else {
      this.logger.log("No peer connection to close")();
    }
    this.sub.unsubscribe(Subscription.allPeerConnectionsForTransfer(this.connectionId), this);
    this.sub.unsubscribe(Subscription.getPeerConnectionId(this.connectionId, this.opponentWsId), this);
    const message: CheckTransferDestroy = { // Destroy parent TransferHandler
      handler: Subscription.getTransferId(this.connectionId),
      action: "checkTransferDestroy",
      allowZeroSubscribers: true,
      wsOpponentId: this.opponentWsId,
    };
    this.sub.notify(message);
  }

  public createPeerConnection(arg?: ConnectToRemoteMessage) {
    this.logger.log("Creating RTCPeerConnection with config {} {}", WEBRTC_RUNTIME_CONFIG, this.pc_constraints)();
    if (!window.RTCPeerConnection) {
      throw Error("Your browser doesn't support RTCPeerConnection");
    }

    this.pc = new (<any>RTCPeerConnection)(WEBRTC_RUNTIME_CONFIG, this.pc_constraints);
    this.pc!.oniceconnectionstatechange = this.oniceconnectionstatechange.bind(this);
    this.pc!.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      this.logger.debug("Got ice candidate {}", event.candidate)();

      /*
       * The hack with candidate length is required to make connection work on some firefox devices
       * see https://bugzilla.mozilla.org/show_bug.cgi?id=1540614
       * otherwise `WebRTC: ICE failed, add a TURN server and see about:webrtc for more details`
       * Note not all Firefox browsers are affected.
       */
      if (event.candidate) {
        this.sendWebRtcEvent(event.candidate);
      }
    };
  }

  public abstract oniceconnectionstatechange(): void;

  public sendWebRtcEvent(message: RTCIceCandidate | RTCSessionDescriptionInit) {
    this.wsHandler.sendRtcData(message, this.connectionId, this.opponentWsId);
  }

  public async createOffer() { // Each peer should be able to createOffer in case of microphone change
    this.logger.log("Creating offer...")();
    this.offerCreator = true;
    const offer: RTCSessionDescriptionInit = await this.pc!.createOffer(this.sdpConstraints);
    if (offer.sdp) {
      offer.sdp = this.setMediaBitrate(offer.sdp, 1638400);
    }
    this.logger.log("Created offer, setting local description")();
    await this.pc!.setLocalDescription(offer);
    this.logger.log("Sending offer to remote")();
    this.sendWebRtcEvent(offer);
  }

  public async respondOffer() {
    this.logger.log("Responding to offer")();
    this.offerCreator = false;
    const answer: RTCSessionDescriptionInit = await this.pc!.createAnswer();
    if (answer.sdp) {
      answer.sdp = this.setMediaBitrate(answer.sdp, 1638400);
    }
    this.logger.log("Sending answer")();
    await this.pc!.setLocalDescription(answer);
    this.sendWebRtcEvent(answer);
  }

  // TODO is this required in 2020?
  public setMediaBitrate(sdp: string, bitrate: number) {
    const lines = sdp.split("\n");
    let line = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("m=")) {
        line = i + 1;
        break;
      }
    }
    if (line === -1) {
      this.logger.debug("Could not find the m line for {}", sdp)();

      return sdp;
    }
    // Skip i and c lines
    while (lines[line].startsWith("i=") || lines[line].startsWith("c=")) {
      line++;
    }
    if (lines[line].startsWith("b")) {
      this.logger.debug("Replaced b line at line {}", line)();
      lines[line] = `b=AS:${bitrate}`;

      return lines.join("\n");
    }
    // Add a new b line
    this.logger.debug("Adding new b line before line {}", line)();
    let newLines = lines.slice(0, line);
    newLines.push(`b=AS:${bitrate}`);
    newLines = newLines.concat(lines.slice(line, lines.length));

    return newLines.join("\n");
  }

  // Destroy(Des)

  // This event comes from websocket from server, which is created by another PC
  public async sendRtcData(message: SendRtcDataMessage) {
    if (!this.connectedToRemote) {
      this.logger.warn("Putting sendrtc data event to the queue")();
      this.sendRtcDataQueue.push(message);
    } else {
      const data: RTCIceCandidateInit | RTCSessionDescriptionInit | {message: unknown} = message.content;
      if (this.pc!.iceConnectionState && this.pc!.iceConnectionState !== "closed") {
        if ((<RTCSessionDescriptionInit>data).sdp) {
          this.logger.log("Creating answer")();
          await this.pc!.setRemoteDescription(new RTCSessionDescription(<RTCSessionDescriptionInit>data));
          if (!this.offerCreator) {
            await this.respondOffer();
          }
          this.offerCreator = false;
        } else if ((<RTCIceCandidateInit>data).candidate) {
          this.logger.log("Adding ice candidate {} ", (<RTCIceCandidateInit>data).candidate)();
          await this.pc!.addIceCandidate(new RTCIceCandidate(<RTCIceCandidateInit>data));
        } else if ((<{message: unknown}>data).message) {
          this.logger.error("Got unknown message {}", (<{message: unknown}>data).message);
        }
      } else {
        this.logger.error("Skipping onsendRtcData message for closed connection")();
      }
    }
  }

  protected onChannelMessage(event: MessageEvent) {
    this.logger.log("Received {} from webrtc data channel", bytesToSize(event.data.byteLength))();
  }
}
