import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {
  RoomLogEntry,
  SetRoomsUsers,
} from "@/ts/types/types";
import type {
  AddRoomBase,
  ChangeDeviceType,
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {
  ChangeP2pRoomInfoMessage,
  ChangeUserOnlineInfoMessage,
  LogoutMessage,
  PubSetRooms,
  RouterNavigateMessage,
} from "@/ts/types/messages/innerMessages";
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
import type {
  ChannelDto,
  RoomDto,
  SetStateFromWS,
} from "@/ts/types/dto";
import type {
  AddChannelMessage,
  AddInviteMessage,
  AddOnlineUserMessage,
  AddRoomMessage,
  CreateNewUsedMessage,
  DeleteChannelMessage,
  DeleteRoomMessage,
  InviteUserMessage,
  LeaveUserMessage,
  RemoveOnlineUserMessage,
  SaveChannelSettingsMessage,
  SaveRoomSettingsMessage,
  ShowITypeMessage,
} from "@/ts/types/messages/wsInMessages";
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

export class RoomHandler extends MessageHandler {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof RoomHandler, "room"> = {
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
    if (message.content[message.userId].length === 0) {
      this.addChangeOnlineEntry(message.userId, message.time, "gone offline");
    }
    this.store.setOnline(message.content);
  }

  public addChannel(message: AddChannelMessage) {
    this.mutateRoomAddition(message, "room_created");
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

  public createNewUser(message: CreateNewUsedMessage) {
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
          userId: message.userId,
        },
      });
      this.notifyDevicesChanged(null, roomId, "someone_joined");
    });
  }

  public addOnlineUser(message: AddOnlineUserMessage) {
    if (message.content[message.userId].length === 1) {
      // Exactly 1 device is now offline, so that new that appeared is the first one
      this.addChangeOnlineEntry(message.userId, message.time, "appeared online");
    }
    this.store.setOnline({...message.content}); // Prevent modifying original object
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
    if (!this.store.channelsDict[message.channelId]) {
      this.logger.error("Unable to find channel to edit {} to kick user, available are {}", message.channelId, Object.keys(this.store.channelsDict))();
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

  public async showIType(message: ShowITypeMessage) {
    if (this.store.myId !== message.userId) {
      await this.store.showUserIsTyping({
        userId: message.userId,
        roomId: message.roomId,
      });
    }
  }

  public saveRoomSettings(message: SaveRoomSettingsMessage) {
    const oldRoom = this.store.roomsDict[message.roomId];
    if (!oldRoom) {
      this.logger.error("Unable to find channel to edit {} to kick user, available are {}", message.roomId, Object.keys(this.store.roomsDict))();
    } else {
      const r: RoomSettingsModel = getRoom(message);
      const oldRoomP2p: boolean = oldRoom.p2p;
      this.store.setRoomSettings(r);
      if (oldRoomP2p !== message.p2p) {
        this.notifyDevicesChanged(null, message.roomId, message.p2p ? "room_created" : "i_deleted");
      }
    }
  }


  public deleteRoom(message: DeleteRoomMessage) {
    this.doRoomDelete(message.roomId);
  }

  public logout(m: LogoutMessage) {
    this.store.logout();
  }

  public init(m: PubSetRooms) {
    const {rooms, channels, users, online} = m;

    /*
     * Otherwise, we will modify value from ws, which will make observable in logs
     * other values from 'm' are converted with convertable
     */
    const ids: PubSetRooms["online"] = JSON.parse(JSON.stringify(online));
    this.store.setOnline(ids);

    this.logger.debug("set users {}", users)();
    const um: UserDictModel = {};
    users.forEach((u) => {
      um[u.userId] = convertUser(u, null);
    });

    this.logger.debug("Setting rooms")();
    const storeRooms: RoomDictModel = {};
    const {roomsDict} = this.store;
    rooms.forEach((newRoom: RoomDto) => {
      const oldRoom = roomsDict[newRoom.roomId];
      const rm: RoomModel = getRoomsBaseDict(newRoom, oldRoom);
      storeRooms[rm.id] = rm;
    });

    this.logger.debug("Setting channels")();
    const {channelsDict} = this.store;
    const storeChannel: ChannelsDictModel = channels.reduce((dict: ChannelsDictModel, newChannel: ChannelDto) => {
      const oldChannel = channelsDict[newChannel.channelId];
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
    this.notifyDevicesChanged(null, message.roomId, type); // TODO messageTransferhandler should be created or should id?
  }
}
