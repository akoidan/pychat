import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeP2pRoomInfoMessage} from "@/ts/types/messages/inner/change.p2p.room.info";
import {ChangeStreamMessage} from "@/ts/types/messages/inner/change.stream";
import {ChangeUserOnlineInfoMessage} from "@/ts/types/messages/inner/change.user.online.info";
import {CheckTransferDestroyMessage} from "@/ts/types/messages/inner/check.transfer.destroy";
import {ConnectToRemoteMessage} from "@/ts/types/messages/inner/connect.to.remote";
import {DestroyPeerConnectionMessage} from "@/ts/types/messages/inner/destroy.peer.connection";
import {InternetAppearMessage} from "@/ts/types/messages/inner/internet.appear";
import {LoginMessage} from "@/ts/types/messages/inner/login";
import {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {PubSetRoomsMessage} from "@/ts/types/messages/inner/pub.set.rooms";
import {RouterNavigateMessage} from "@/ts/types/messages/inner/router.navigate";
import {SendSetMessagesStatusMessage} from "@/ts/types/messages/inner/send.set.messages.status";
import {SyncP2PMessage} from "@/ts/types/messages/inner/sync.p2p";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type WebRtcApi from "@/ts/webrtc/WebRtcApi";
import type {MessageSender} from "@/ts/types/types";
import type WsMessageHandler from "@/ts/message_handlers/WsMessageHandler";

export class MessageSenderProxy {
  private readonly store: DefaultStore;

  private readonly webrtcApi: WebRtcApi;

  private readonly wsMessageHandler: WsMessageHandler;

  public constructor(
    store: DefaultStore,
    webrtcApi: WebRtcApi,
    wsMessageHandler: WsMessageHandler,
  ) {
    this.store = store;
    this.webrtcApi = webrtcApi;
    this.wsMessageHandler = wsMessageHandler;
    webrtcApi.setMessageSenderProxy(this);
  }

  /*
   * UniqueMessages is also used in abstract Processsor, but here it's negative numbers only
   * and in another place is positive, so they don't intersect
   */
  getUniqueNegativeMessageId(): number {
    const ID_RANGE = 1_000_000_000;
    let myId: number = this.store.myId! ?? this.getRandomInt(1000);
    if (myId > 1000) {
      myId %= 1000;
    }
    return -(this.getRandomInt(ID_RANGE) + myId * ID_RANGE);
  }

  getMessageSender(roomId: number): MessageSender {
    if (this.store.roomsDict[roomId].p2p) {
      return this.webrtcApi.getMessageHandler(roomId);
    }
    return this.wsMessageHandler;
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
}
