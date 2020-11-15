import { DefaultStore } from "@/ts/classes/DefaultStore";
import WebRtcApi from "@/ts/webrtc/WebRtcApi";
import { MessageSender } from "@/ts/types/types";
import ChannelsHandler from "@/ts/message_handlers/ChannelsHandler";

export class MessageSenderProxy {

  private readonly store: DefaultStore;
  private readonly webrtcApi: WebRtcApi;
  private readonly channelsHandler: ChannelsHandler;

  constructor(store: DefaultStore, webrtcApi: WebRtcApi, channelsHandler: ChannelsHandler) {
    this.store = store;
    this.webrtcApi = webrtcApi;
    this.channelsHandler = channelsHandler;
  }

  getMessageSender(roomId: number): MessageSender {
    if (this.store.roomsDict[roomId].p2p) {
      return this.webrtcApi.getMessageHandler(roomId);
    } else {
      return this.channelsHandler;
    }
  }

}