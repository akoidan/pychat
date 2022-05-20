
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


import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import {ChannelDto} from '@common/model/dto/channel.dto';
import {FileModelDto} from '@common/model/dto/file.model.dto';
import {LocationDto} from '@common/model/dto/location.dto';
import {MessageModelDto} from '@common/model/dto/message.model.dto';
import {
  RoomDto,
  RoomNoUsersDto
} from '@common/model/dto/room.dto';
import {UserDto} from '@common/model/dto/user.dto';
import {UserSettingsDto} from '@common/model/dto/user.settings.dto';
import type {
  ChannelModel,
  CurrentUserInfoModel,
  CurrentUserInfoWoImage,
  CurrentUserSettingsModel,
  FileModel,
  Location,
  MessageModel,
  RoomModel,
  RoomSettingsModel,
  UserModel,
} from "@/ts/types/model";

import type {BooleanDB,} from "@/ts/types/db";
import type {MessageP2pDto} from "@/ts/types/messages/p2pDto";
import {UserProfileDtoWoImage} from "@common/model/dto/user.profile.dto";


export function currentUserInfoDtoToModel(userInfo: UserProfileDtoWoImage): CurrentUserInfoWoImage {
  return {...userInfo};
}

export function userSettingsDtoToModel(userInfo: UserSettingsDto): CurrentUserSettingsModel {
  return {...userInfo};
}

export function currentUserInfoModelToDto(userInfo: CurrentUserInfoModel): UserProfileDtoWoImage {
  return {...userInfo};
}

export function convertSex(dto: Gender): Gender {
  return dto;
}

export function convertLocation(dto: LocationDto | null): Location {
  if (!dto) {
    return {
      city: null,
      country: null,
      countryCode: null,
      region: null,
    };
  }
  return {...dto};
}

export function getChannelDict(
  {
    name,
    creatorId,
    id,
  }: ChannelDto,
  oldChannel: ChannelModel | null = null,
): ChannelModel {
  return {
    name,
    id,
    creatorId,
    expanded: oldChannel?.expanded ?? false,
  };
}

export function getRoom(r: RoomNoUsersDto): RoomSettingsModel {
  return {
    channelId: r.channelId,
    p2p: r.p2p,
    id: r.id,
    name: r.name,
    isMainInChannel: r.isMainInChannel,
    notifications: r.notifications,
    volume: r.volume,
    creatorId: r.creatorId,
  };
}

export function getRoomsBaseDict(
  {
    id,
    volume,
    channelId,
    isMainInChannel,
    notifications,
    creatorId,
    p2p,
    name,
    users,
  }: RoomDto,
  databaseRestoredRoom: RoomModel | null = null,
): RoomModel {
  return {
    id,
    receivingFiles: databaseRestoredRoom ? databaseRestoredRoom.receivingFiles : {},
    sendingFiles: databaseRestoredRoom ? databaseRestoredRoom.sendingFiles : {},
    channelId,
    volume,
    p2p,
    isMainInChannel,
    usersTyping: {},
    p2pInfo: {
      liveConnections: [],
    },
    callInfo: {
      calls: {},
      callActiveButNotJoinedYet: false,
      mediaStreamLink: null,
      showMic: true,
      sharePaint: false,
      callActive: false,
      shareScreen: false,
      showVideo: false,
      currentMic: null,
      currentSpeaker: null,
      currentWebcam: null,
      currentMicLevel: 0,
    },
    notifications,
    name,
    creatorId,
    messages: databaseRestoredRoom ? databaseRestoredRoom.messages : {},
    roomLog: databaseRestoredRoom ? databaseRestoredRoom.roomLog : [],
    changeName: databaseRestoredRoom ? databaseRestoredRoom.changeName : [],
    allLoaded: databaseRestoredRoom ? databaseRestoredRoom.allLoaded : false,
    search: databaseRestoredRoom ? databaseRestoredRoom.search : {
      searchActive: false,
      searchText: "",
      messages: [],
      locked: false,
    },
    users,
  };
}

export function convertToBoolean(value: BooleanDB): boolean {
  return value === 1;
}

export function messageModelToP2p(m: MessageModel): MessageP2pDto {
  return {
    content: m.content,
    deleted: m.deleted,
    edited: m.edited,
    files: {},
    id: m.id,
    status: m.status,
    parentMessage: m.parentMessage,
    symbol: m.symbol,
    timeAgo: Date.now() - m.time,
    userId: m.userId,
  };
}


export function convertFiles(dtos: Record<number, FileModelDto>): Record<number, FileModel> {
  const res: Record<number, FileModel> = {};
  for (const k in dtos) {
    const dto = dtos[k];
    res[k] = {
      fileId: null,
      serverId: dto.id,
      sending: false,
      previewFileId: null,
      preview: dto.preview,
      type: dto.type,
      url: dto.url,
    };
  }
  return res;
}

export function convertMessageModelDtoToModel(message: MessageModelDto, oldMessage: MessageModel | null, timeConverter: (time: number) => number): MessageModel {
  if (message.threadMessagesCount === undefined) {
    throw Error("WTF");
  }
  return {
    id: message.id,
    time: timeConverter(message.time),
    isHighlighted: oldMessage ? oldMessage.isHighlighted : false,
    files: message.files ? convertFiles(message.files) : null,
    content: message.content || null,
    symbol: message.symbol || null,
    threadMessagesCount: message.threadMessagesCount,
    edited: message.edited,
    isEditingActive: oldMessage ? oldMessage.isEditingActive : false,
    isThreadOpened: oldMessage ? oldMessage.isThreadOpened : false,
    roomId: message.roomId,
    userId: message.userId,
    transfer: null,
    tags: {...message.tags}, // Prevent modifying original object by vuex
    parentMessage: message.parentMessage,
    status: message.status,
    deleted: message.deleted || false,
  };
}

export function p2pMessageToModel(m: MessageP2pDto, roomId: number): MessageModel {
  let status: MessageStatus = MessageStatus.RECEIVED;
  if (m.status === MessageStatus.READ) {
    status = MessageStatus.READ;
  }
  return {
    content: m.content,
    deleted: m.deleted,
    edited: m.edited,
    parentMessage: m.parentMessage,
    files: {},
    tags: {}, // TODO
    threadMessagesCount: 0, // TODO
    isThreadOpened: false,
    isEditingActive: false,
    id: m.id,
    symbol: m.symbol,
    time: Date.now() - m.timeAgo,
    userId: m.userId,
    status,
    roomId,
    isHighlighted: false,
    transfer: null,
  };
}

export function convertUser(u: UserDto, location: LocationDto | null): UserModel {
  return {
    username: u.username,
    id: u.id,
    thumbnail: u.thumbnail,
    lastTimeOnline: u.lastTimeOnline,
    sex: convertSex(u.sex),
    location: convertLocation(location),
  };
}
