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
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";
import {
  AddChannelMessage,
  AddInviteMessage,
  AddRoomBase,
  AddRoomMessage,
  ChangeDeviceType,
  CreateNewUsedMessage,
  DeleteChannelMessage,
  DeleteRoomMessage,
  InviteUserMessage,
  LeaveUserMessage,
  RemoveOnlineUserMessage,
  SaveChannelSettingsMessage,
  SaveRoomSettingsMessage
} from "@common/legacy";
import {ChannelDto} from '@common/model/dto/channel.dto';
import {RoomDto} from '@common/model/dto/room.dto';
import {ShowITypeWsInMessage} from '@common/ws/message/show.i.type';
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {
  RoomLogEntry,
  SetRoomsUsers,
} from "@/ts/types/types";

import type {
  ChannelModel,
  ChannelsDictModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserDictModel,
  UserModel,
} from "@/ts/types/model";
import {
  convertUser,
  getChannelDict,
  getRoom,
  getRoomsBaseDict,
} from "@/ts/types/converters";

import {ALL_ROOM_ID} from "@/ts/utils/consts";
import type {Logger} from "lines-logger";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type Api from "@/ts/message_handlers/Api";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {AudioPlayer} from "@/ts/classes/AudioPlayer";
import loggerFactory from "@/ts/instances/loggerFactory";
import {
  login,
  logout,
} from "@/ts/utils/audio";
import type Subscription from "@/ts/classes/Subscription";

import {SetStateFromWS} from "@/ts/types/dto";


export class RoomHandler extends MessageHandler {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof RoomHandler> = {
    deleteRoom: <HandlerType<"deleteRoom", "room">> this.deleteRoom,
    init: <HandlerType<"init", "room">> this.init,
    leaveUser: <HandlerType<"leaveUser", "room">> this.leaveUser,
    addRoom: <HandlerType<"addRoom", "room">> this.addRoom,
    removeOnlineUser: <HandlerType<"removeOnlineUser", "room">> this.removeOnlineUser,
    addChannel: <HandlerType<"addChannel", "room">> this.addChannel,
    inviteUser: <HandlerType<"inviteUser", "room">> this.inviteUser,
    addInvite: <HandlerType<"addInvite", "room">> this.addInvite,
    addOnlineUser: <HandlerType<"addOnlineUser", "room">> this.addOnlineUser,
    saveChannelSettings: <HandlerType<"saveChannelSettings", "room">> this.saveChannelSettings,
    deleteChannel: <HandlerType<"deleteChannel", "room">> this.deleteChannel,
    saveRoomSettings: <HandlerType<"saveRoomSettings", "room">> this.saveRoomSettings,
    createNewUser: <HandlerType<"createNewUser", "room">> this.createNewUser,
    showIType: <HandlerType<"showIType", "room">> this.showIType,
    logout: <HandlerType<"logout", "room">> this.logout,
  };

  private readonly store: DefaultStore;

  private readonly ws: WsHandler;

  private readonly audioPlayer: AudioPlayer;

  private readonly sub: Subscription;

  public constructor(
    store: DefaultStore,
    api: Api,
    ws: WsHandler,
    audioPlayer: AudioPlayer,
    sub: Subscription,
  ) {
    super();
    this.store = store;
    this.sub = sub;
    sub.subscribe("room", this);
    this.logger = loggerFactory.getLogger("room");
    this.ws = ws;
    this.audioPlayer = audioPlayer;
  }

  public leaveUser(message: LeaveUserMessage) {
    if (this.store.roomsDict[message.roomId]) {
      const m: SetRoomsUsers = {
        roomId: message.roomId,
        users: message.users,
      };
      this.store.setRoomsUsers(m);
      this.store.addRoomLog({
        roomLog: {
          userId: message.userId,
          time: Date.now(),
          action: "left this room",
        },
        roomIds: [message.roomId],
      });
      this.notifyDevicesChanged(message.userId, message.roomId, "someone_left");
    } else {
      this.logger.error("Unable to find room {} to kick user", message.roomId)();
    }
  }

  public addRoom(message: AddRoomMessage) {
    this.mutateRoomAddition(message, "room_created");
  }

  public removeOnlineUser(message: RemoveOnlineUserMessage) {
    if (message.online[message.userId].length === 0) {
      this.addChangeOnlineEntry(message.userId, message.time, "gone offline");
    }
    this.store.setOnline(message.online);
  }

  public addChannel(message: AddChannelMessage) {
    // TODO
    this.mutateRoomAddition(message as any, "room_created");
  }

  public inviteUser(message: InviteUserMessage) {
    this.store.setRoomsUsers({
      roomId: message.roomId,
      users: message.users,
    } as SetRoomsUsers);
    message.inviteeUserId.forEach((i) => {
      this.store.addRoomLog({
        roomIds: [message.roomId],
        roomLog: {
          action: "joined this room",
          time: message.time,
          userId: i,
        },
      });
    });
    this.notifyDevicesChanged(null, message.roomId, "someone_joined");
  }

  public addInvite(message: AddInviteMessage) {
    this.mutateRoomAddition(message, "invited");
  }

  public createNewUser(message: CreateNewUserMessage) {
    const newVar: UserModel = convertUser(message, null);
    this.store.addUser(newVar);
    message.rooms.forEach(({roomId, users}) => {
      this.store.setRoomsUsers({
        roomId,
        users,
      } as SetRoomsUsers);

      this.store.addRoomLog({
        roomIds: [roomId],
        roomLog: {
          action: "joined this room",
          time: Date.now(),
          userId: message.id,
        },
      });
      this.notifyDevicesChanged(null, roomId, "someone_joined");
    });
  }

  public addOnlineUser(message: AddOnlineUserMessage) {
    if (message.online[message.userId].length === 1) {
      // Exactly 1 device is now offline, so that new that appeared is the first one
      this.addChangeOnlineEntry(message.userId, message.time, "appeared online");
    }
    this.store.setOnline({...message.online}); // Prevent modifying original object
    const payload: ChangeUserOnlineInfoMessage = {
      handler: "webrtc",
      allowZeroSubscribers: true,
      action: "changeOnline",
      changeType: "appear_online",
      userId: message.userId,
      opponentWsId: message.opponentWsId,
    };
    this.sub.notify(payload);
  }

  public saveChannelSettings(message: SaveChannelSettingsMessage) {
    if (!this.store.channelsDict[message.id]) {
      this.logger.error("Unable to find channel to edit {} to kick user, available are {}", message.id, Object.keys(this.store.channelsDict))();
    } else {
      const c: ChannelModel = getChannelDict(message);
      this.store.addChannel(c);
      if (this.store.myId === message.userId) {
        const oldRoom: RoomModel = {...this.store.channelsDictUI[c.id].mainRoom};
        oldRoom.volume = message.volume,
        oldRoom.notifications = message.notifications;
        this.store.setRoomSettings(oldRoom);
      }
    }
  }

  public deleteChannel(message: DeleteChannelMessage) {
    this.store.deleteChannel(message.channelId);
    message.roomIds.forEach((id) => {
      this.doRoomDelete(id);
    });
  }

  public async showIType(message: ShowITypeWsInMessage) {
    if (this.store.myId !== message.userId) {
      await this.store.showUserIsTyping({
        userId: message.userId,
        roomId: message.roomId,
      });
    }
  }

  public saveRoomSettings(message: SaveRoomSettingsMessage) {
    const oldRoom = this.store.roomsDict[message.id];
    if (!oldRoom) {
      this.logger.error("Unable to find channel to edit {} to kick user, available are {}", message.id, Object.keys(this.store.roomsDict))();
    } else {
      const r: RoomSettingsModel = getRoom(message);
      const oldRoomP2p: boolean = oldRoom.p2p;
      this.store.setRoomSettings(r);
      if (oldRoomP2p !== message.p2p) {
        this.notifyDevicesChanged(null, message.id, message.p2p ? "room_created" : "i_deleted");
      }
    }
  }


  public deleteRoom(message: DeleteRoomMessage) {
    this.doRoomDelete(message.roomId);
  }

  public logout(m: LogoutMessage) {
    this.store.logout();
  }

  public init(m: PubSetRoomsMessage) {
    const {rooms, channels, users, online} = m;

    /*
     * Otherwise, we will modify value from ws, which will make observable in logs
     * other values from 'm' are converted with convertable
     */
    const ids: PubSetRoomsMessage["online"] = JSON.parse(JSON.stringify(online));
    this.store.setOnline(ids);

    this.logger.debug("set users {}", users)();
    const um: UserDictModel = {};
    users.forEach((u) => {
      um[u.id] = convertUser(u, null);
    });

    this.logger.debug("Setting rooms")();
    const storeRooms: RoomDictModel = {};
    const {roomsDict} = this.store;
    rooms.forEach((newRoom: RoomDto) => {
      const oldRoom = roomsDict[newRoom.id];
      const rm: RoomModel = getRoomsBaseDict(newRoom, oldRoom);
      storeRooms[rm.id] = rm;
    });

    this.logger.debug("Setting channels")();
    const {channelsDict} = this.store;
    const storeChannel: ChannelsDictModel = channels.reduce((dict: ChannelsDictModel, newChannel: ChannelDto) => {
      const oldChannel = channelsDict[newChannel.id];
      const cm: ChannelModel = getChannelDict(newChannel, oldChannel);
      dict[cm.id] = cm;
      return dict;
    }, {});

    const newState: SetStateFromWS = {
      allUsersDict: um,
      channelsDict: storeChannel,
      roomsDict: storeRooms,
    };

    this.store.setStateFromWS(newState);
  }

  private doRoomDelete(roomId: number) {
    if (this.store.roomsDict[roomId]) {
      if (this.store.activeRoomId === roomId) {
        const m: RouterNavigateMessage = {
          action: "navigate",
          handler: "router",
          to: `/chat/${ALL_ROOM_ID}`,
        };
        this.store.growlInfo(`Room #${roomId} has been deleted. Navigating to main room`);
        this.sub.notify(m);
      }
      this.store.deleteRoom(roomId);
    } else {
      this.logger.error("Unable to find room {} to delete", roomId)();
    }
    this.notifyDevicesChanged(null, roomId, "i_deleted");
  }

  private addChangeOnlineEntry(userId: number, serverTime: number, action: "appeared online" | "gone offline") {
    if (this.store.myId == userId) {
      return; // Do nto display I appear Online
    }
    const roomIds: number[] = this.store.roomsArray.filter((r) => r.users.includes(userId)).map((r) => r.id);
    const entry: RoomLogEntry = {
      roomIds,
      roomLog: {
        action,
        time: this.ws.convertServerTimeToPC(serverTime),
        userId,
      },
    };

    // TODO Uncaught TypeError: Cannot read property 'onlineChangeSound' of null
    if (this.store.userSettings!.onlineChangeSound) {
      this.audioPlayer.checkAndPlay(action === "appeared online" ? login : logout, 50);
    }
    this.store.addRoomLog(entry);
  }

  private notifyDevicesChanged(userId: number | null, roomId: number, type: ChangeDeviceType) {
    const message: ChangeP2pRoomInfoMessage = {
      handler: "webrtc",
      action: "changeDevices",
      changeType: type,
      allowZeroSubscribers: true,
      roomId,
      userId,
    };
    this.sub.notify(message);
  }

  private mutateRoomAddition(message: AddRoomBase, type: "invited" | "room_created") {
    if (message.channelId) {
      // As (Omit<AddRoomMessage, 'action'> & {action: 'addChannel'})
      const channelDict: ChannelModel = getChannelDict(message as any);
      this.store.addChannel(channelDict);
    }
    const r: RoomModel = getRoomsBaseDict(message);
    this.store.addRoom(r);
    this.store.addRoomLog({
      roomIds: [r.id],
      roomLog: {
        action: "been invited to this room",
        time: message.time,
        userId: this.store.myId!,
      },
    });
    // Eiher I created this room, either I was invited to this room
    this.notifyDevicesChanged(null, message.id, type); // TODO messageTransferhandler should be created or should id?
  }
}
