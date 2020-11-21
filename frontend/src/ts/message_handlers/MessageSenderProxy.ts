import { DefaultStore } from '@/ts/classes/DefaultStore';
import WebRtcApi from '@/ts/webrtc/WebRtcApi';
import {
  IStorage,
  MessageSender
} from '@/ts/types/types';
import ChannelsHandler from '@/ts/message_handlers/ChannelsHandler';

export class MessageSenderProxy {

  private readonly store: DefaultStore;
  private readonly webrtcApi: WebRtcApi;
  private readonly channelsHandler: ChannelsHandler;
  private readonly storage: IStorage; // only for minId

  constructor(
      store: DefaultStore,
      webrtcApi: WebRtcApi,
      channelsHandler: ChannelsHandler,
      storage: IStorage
  ) {
    this.store = store;
    this.webrtcApi = webrtcApi;
    this.channelsHandler = channelsHandler;
    this.storage = storage;
  }

  // uniqueMessages is also used in abstract Processsor, but here it's negative numbers only
  // and in another place is positive, so they don't intersect
  getUniqueNegativeMessageId(): number {
    return this.storage.getMinMessageId();
  }

  syncMessages() {
    this.channelsHandler.syncMessages();
    this.store.roomsArray.forEach(room => {
      if (room.p2p) {
        this.webrtcApi.getMessageHandler(room.id).syncMessages();
      }
    });
  }

  getMessageSender(roomId: number): MessageSender {
    if (this.store.roomsDict[roomId].p2p) {
      return this.webrtcApi.getMessageHandler(roomId);
    } else {
      return this.channelsHandler;
    }
  }

}