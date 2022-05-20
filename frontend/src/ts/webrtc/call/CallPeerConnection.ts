import {FaceBookSignInRequest, FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import {GoogleSignInRequest, GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import {SignInRequest, SignInResponse} from "@common/http/auth/sign.in";
import {SignUpRequest, SignUpResponse} from "@common/http/auth/sign.up";
import {ValidateUserRequest, ValidateUserResponse} from "@common/http/auth/validate.user";
import {ValidateEmailResponse, ValidateUserEmailRequest} from "@common/http/auth/validte.email";
import {SaveFileRequest, SaveFileResponse} from "@common/http/file/save.file";
import {AcceptTokenRequest, AcceptTokenResponse} from "@common/http/verify/accept.token";
import {ConfirmEmailRequest, ConfirmEmailResponse} from "@common/http/verify/confirm.email";
import {SendRestorePasswordRequest, SendRestorePasswordResponse} from "@common/http/verify/send.restore.password";
import {VerifyTokenRequest, VerifyTokenResponse} from "@common/http/verify/verify.token";
import {ChannelDto} from "@common/model/dto/channel.dto";
import {FileModelDto} from "@common/model/dto/file.model.dto";
import {GiphyDto} from "@common/model/dto/giphy.dto";
import {LocationDto} from "@common/model/dto/location.dto";
import {MessageModelDto} from "@common/model/dto/message.model.dto";
import {RoomDto, RoomNoUsersDto} from "@common/model/dto/room.dto";
import {UserDto} from "@common/model/dto/user.dto";
import {UserProfileDto, UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";
import {UserSettingsDto} from "@common/model/dto/user.settings.dto";
import {Gender} from "@common/model/enum/gender";
import {ImageType} from "@common/model/enum/image.type";
import {MessageStatus} from "@common/model/enum/message.status";
import {Theme} from "@common/model/enum/theme";
import {VerificationType} from "@common/model/enum/verification.type";
import {CaptchaRequest, OauthSessionResponse, OkResponse, SessionResponse} from "@common/model/http.base";
import {BrowserBase, CallStatus, OpponentWsId, ReplyWebRtc, WebRtcDefaultMessage} from "@common/model/webrtc.base";
import {
  AddRoomBase, ChangeDeviceType, ChangeOnlineType,
  ChangeUserOnlineBase,
  MessagesResponseMessage,
  NewRoom,
  RoomExistedBefore
} from "@common/model/ws.base";
import {
  DestroyCallConnectionBody,
  DestroyCallConnectionMessage
} from "@common/ws/message/peer-connection/destroy.call.connection";
import {
  DestroyFileConnectionBody,
  DestroyFileConnectionMessage
} from "@common/ws/message/peer-connection/destroy.file.connection";
import {RetryFileMessage} from "@common/ws/message/peer-connection/retry.file";
import {SendRtcDataBody, SendRtcDataMessage} from "@common/ws/message/peer-connection/send.rtc.data";
import {AddChannelBody, AddChannelMessage} from "@common/ws/message/room/add.channel";
import {AddInviteBody, AddInviteMessage} from "@common/ws/message/room/add.invite";
import {AddOnlineUserBodyMessage, AddOnlineUserMessage} from "@common/ws/message/room/add.online.user";
import {AddRoomBody, AddRoomMessage} from "@common/ws/message/room/add.room";
import {CreateNewUsedMessage, CreateNewUserBody} from "@common/ws/message/room/create.new.user";
import {DeleteChannelBody, DeleteChannelMessage} from "@common/ws/message/room/delete.channel";
import {DeleteRoomBody, DeleteRoomMessage} from "@common/ws/message/room/delete.room";
import {InviteUserBody, InviteUserMessage} from "@common/ws/message/room/invite.user";
import {LeaveUserBody, LeaveUserMessage} from "@common/ws/message/room/leave.user";
import {RemoveOnlineUserBody, RemoveOnlineUserMessage} from "@common/ws/message/room/remove.online.user";
import {SaveChannelSettingsBody, SaveChannelSettingsMessage} from "@common/ws/message/room/save.channel.settings";
import {SaveRoomSettingsBody, SaveRoomSettingsMessage} from "@common/ws/message/room/save.room.settings";
import {
  ShowITypeWsInBody,
  ShowITypeWsInMessage,
  ShowITypeWsOutBody,
  ShowITypeWsOutMessage
} from "@common/ws/message/room/show.i.type";
import {WebRtcSetConnectionIdBody, WebRtcSetConnectionIdMessage} from "@common/ws/message/sync/set.connection.id";
import {NotifyCallActiveBody, NotifyCallActiveMessage} from "@common/ws/message/webrtc/notify.call.active";
import {OfferCallBody, OfferCallMessage} from "@common/ws/message/webrtc/offer.call";
import {OfferFileBody, OfferFileContent, OfferFileMessage} from "@common/ws/message/webrtc/offer.file";
import {OfferBody, OfferMessage} from "@common/ws/message/webrtc/offer.message";
import {AcceptCallBody, AcceptCallMessage} from "@common/ws/message/webrtc-transfer/accept.call";
import {AcceptFileBody, AcceptFileMessage} from "@common/ws/message/webrtc-transfer/accept.file";
import {ReplyCallBody, ReplyCallMessage} from "@common/ws/message/webrtc-transfer/reply.call";
import {ReplyFileBody, ReplyFileMessage} from "@common/ws/message/webrtc-transfer/reply.file";
import {PingBody, PingMessage} from "@common/ws/message/ws/ping";
import {PongBody, PongMessage} from "@common/ws/message/ws/pong";
import {SetProfileImageBody, SetProfileImageMessage} from "@common/ws/message/ws/set.profile.image";
import {SetSettingBody, SetSettingsMessage} from "@common/ws/message/ws/set.settings";
import {SetUserProfileBody, SetUserProfileMessage} from "@common/ws/message/ws/set.user.profile";
import {SetWsIdWsOutBody, SetWsIdWsOutMessage} from "@common/ws/message/ws/set.ws.id";
import {UserProfileChangedBody, UserProfileChangedMessage} from "@common/ws/message/ws/user.profile.changed";
import {DeleteMessage, DeleteMessageBody} from "@common/ws/message/ws-message/delete.message";
import {
  PrintMessageWsInMessage,
  PrintMessageWsOutBody,
  PrintMessageWsOutMessage
} from "@common/ws/message/ws-message/print.message";
import {
  GetCountryCodeWsInBody, GetCountryCodeWsInMessage,
  GetCountryCodeWsOutBody,
  GetCountryCodeWsOutMessage
} from "@common/ws/message/get.country.code";
import {GrowlWsInBody, GrowlWsInMessage} from "@common/ws/message/growl.message";
import {
  SetMessageStatusWsInBody, SetMessageStatusWsInMessage,
  SetMessageStatusWsOutBody,
  SetMessageStatusWsOutMessage
} from "@common/ws/message/set.message.status";
import {
  SyncHistoryWsInBody,
  SyncHistoryWsInMessage,
  SyncHistoryWsOutBody,
  SyncHistoryWsOutMessage
} from "@common/ws/message/sync.history";
import {
  DefaultWsInMessage,
  DefaultWsOutMessage,
  HandlerName,
  RequestWsOutMessage,
  ResponseWsInMessage
} from "@common/ws/common";
import {ALL_ROOM_ID, MAX_USERNAME_LENGTH, WS_SESSION_EXPIRED_CODE} from "@common/consts";
import {ChangeStreamMessage} from "@/ts/types/messages/inner/change.stream";
import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import {DestroyPeerConnectionMessage} from "@/ts/types/messages/inner/destroy.peer.connection";
import {DestroyCallConnection} from "@common/legacy";
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
