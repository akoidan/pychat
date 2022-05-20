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
