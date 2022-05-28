import type {ChannelDto} from "@common/model/dto/channel.dto";
import type {RoomDto} from "@common/model/dto/room.dto";
import type {AddRoomBase, ChangeDeviceType} from "@common/model/ws.base";
import {AddChannelWsInBody} from "@common/ws/message/room/add.channel";
import type {
  AddChannelWsInMessage,
} from "@common/ws/message/room/add.channel";
import {AddInviteWsInBody} from "@common/ws/message/room/add.invite";
import type {
  AddInviteWsInMessage,
} from "@common/ws/message/room/add.invite";
import {AddOnlineUserWsInBody} from "@common/ws/message/room/add.online.user";
import type {
  AddOnlineUserWsInMessage,
} from "@common/ws/message/room/add.online.user";
import {AddRoomWsInBody} from "@common/ws/message/room/add.room";
import type {
  AddRoomWsInMessage,
} from "@common/ws/message/room/add.room";
import {DeleteChannelWsInBody} from "@common/ws/message/room/delete.channel";
import type {
  DeleteChannelWsInMessage,
} from "@common/ws/message/room/delete.channel";
import {DeleteRoomWsInBody} from "@common/ws/message/room/delete.room";
import type {
  DeleteRoomWsInMessage,
} from "@common/ws/message/room/delete.room";
import {InviteUserWsInBody} from "@common/ws/message/room/invite.user";
import type {
  InviteUserWsInMessage,
} from "@common/ws/message/room/invite.user";
import {LeaveUserWsInBody} from "@common/ws/message/room/leave.user";
import type {
  LeaveUserWsInMessage,
} from "@common/ws/message/room/leave.user";
import {RemoveOnlineUserWsInBody} from "@common/ws/message/room/remove.online.user";
import type {
  RemoveOnlineUserWsInMessage,
} from "@common/ws/message/room/remove.online.user";
import {SaveChannelSettingsWsInBody} from "@common/ws/message/room/save.channel.settings";
import type {
  SaveChannelSettingsWsInMessage,
} from "@common/ws/message/room/save.channel.settings";
import type {
  SaveRoomSettingsWsInBody,
  SaveRoomSettingsWsInMessage
} from "@common/ws/message/room/save.room.settings";

import type {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import type {ChangeOnlineMessage} from "@/ts/types/messages/inner/change.user.online.info";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";
import type {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import type {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";

import type {RoomLogEntry, SetRoomsUsers} from "@/ts/types/types";

import type {
  ChannelModel,
  ChannelsDictModel,
  RoomDictModel,
  RoomModel,
  RoomSettingsModel,
  UserDictModel,
  UserModel,
} from "@/ts/types/model";
import {convertUser, getChannelDict, getRoom, getRoomsBaseDict} from "@/ts/types/converters";

import {ALL_ROOM_ID} from "@/ts/utils/consts";
import type {Logger} from "lines-logger";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type HttpApi from "@/ts/message_handlers/HttpApi";
import type WsApi from "@/ts/message_handlers/WsApi";
import type {AudioPlayer} from "@/ts/classes/AudioPlayer";
import loggerFactory from "@/ts/instances/loggerFactory";
import {login, logout} from "@/ts/utils/audio";
import type Subscription from "@/ts/classes/Subscription";

import type {SetStateFromWS} from "@/ts/types/dto";
import {Subscribe} from "@/ts/utils/pubsub";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {PubSetRoomsMessageBody} from "@/ts/types/messages/inner/pub.set.rooms";
import {
  ShowITypeWsInBody,
  ShowITypeWsInMessage
} from "@common/ws/message/room/show.i.type";
import {
  CreateNewUserWsInBody,
  CreateNewUserWsInMessage
} from "@common/ws/message/room/create.new.user";


export class RoomHandler {
  protected readonly logger: Logger;

  private readonly store: DefaultStore;

  private readonly ws: WsApi;

  private readonly audioPlayer: AudioPlayer;

  private readonly sub: Subscription;

  public constructor(
    store: DefaultStore,
    api: HttpApi,
    ws: WsApi,
    audioPlayer: AudioPlayer,
    sub: Subscription,
  ) {
    this.store = store;
    this.sub = sub;
    sub.subscribe("room", this);
    this.logger = loggerFactory.getLogger("room");
    this.ws = ws;
    this.audioPlayer = audioPlayer;
  }

  @Subscribe<LeaveUserWsInMessage>()
  public leaveUser(message: LeaveUserWsInBody) {
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

  @Subscribe<AddRoomWsInMessage>()
  public addRoom(message: AddRoomWsInBody) {
    this.mutateRoomAddition(message, "room_created");
  }

  @Subscribe<RemoveOnlineUserWsInMessage>()
  public removeOnlineUser(message: RemoveOnlineUserWsInBody) {
    if (message.online[message.userId].length === 0) {
      this.addChangeOnlineEntry(message.userId, message.time, "gone offline");
    }
    this.store.setOnline(message.online);
  }

  @Subscribe<AddChannelWsInMessage>()
  public addChannel(message: AddChannelWsInBody) {
    this.mutateRoomAddition(message, "room_created");
  }

  @Subscribe<InviteUserWsInMessage>()
  public inviteUser(message: InviteUserWsInBody) {
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

  @Subscribe<AddInviteWsInMessage>()
  public addInvite(message: AddInviteWsInBody) {
    this.mutateRoomAddition(message, "invited");
  }

  @Subscribe<CreateNewUserWsInMessage>()
  public createNewUser(message: CreateNewUserWsInBody) {
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

  @Subscribe<AddOnlineUserWsInMessage>()
  public addOnlineUser(message: AddOnlineUserWsInBody) {
    if (message.online[message.userId].length === 1) {
      // Exactly 1 device is now offline, so that new that appeared is the first one
      this.addChangeOnlineEntry(message.userId, message.time, "appeared online");
    }
    this.store.setOnline({...message.online}); // Prevent modifying original object
    const payload: ChangeOnlineMessage = {
      handler: "webrtc",
      allowZeroSubscribers: true,
      action: "changeOnline",
      changeType: "appear_online",
      userId: message.userId,
      opponentWsId: message.opponentWsId,
    };
    this.sub.notify(payload);
  }

  @Subscribe<SaveChannelSettingsWsInMessage>()
  public saveChannelSettings(message: SaveChannelSettingsWsInBody) {
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

  @Subscribe<DeleteChannelWsInMessage>()
  public deleteChannel(message: DeleteChannelWsInBody) {
    this.store.deleteChannel(message.channelId);
    message.roomIds.forEach((id) => {
      this.doRoomDelete(id);
    });
  }

  @Subscribe<ShowITypeWsInMessage>()
  public async showIType(message: ShowITypeWsInBody) {
    if (this.store.myId !== message.userId) {
      await this.store.showUserIsTyping({
        userId: message.userId,
        roomId: message.roomId,
      });
    }
  }

  @Subscribe<SaveRoomSettingsWsInMessage>()
  public saveRoomSettings(message: SaveRoomSettingsWsInBody) {
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

  @Subscribe<DeleteRoomWsInMessage>()
  public deleteRoom(message: DeleteRoomWsInBody) {
    this.doRoomDelete(message.roomId);
  }

  @Subscribe<LogoutMessage>()
  public logout() {
    this.store.logout();
  }

  @Subscribe<PubSetRoomsMessage>()
  public init(m: PubSetRoomsMessageBody) {
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
      // As (Omit<AddRoomWsInMessage, 'action'> & {action: 'addChannel'})
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
