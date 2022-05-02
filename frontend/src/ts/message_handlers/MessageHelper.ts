import faviconUrl from "@/assets/img/favicon.ico";
import {incoming} from "@/ts/utils/audio";
import type {
  FileModel,
  MessageModel,
} from "@/ts/types/model";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import type {AudioPlayer} from "@/ts/classes/AudioPlayer";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import {resolveMediaUrl} from "@/ts/utils/htmlApi";
import type Subscription from "@/ts/classes/Subscription";

export class MessageHelper {
  private readonly logger: Logger;

  private readonly store: DefaultStore;

  private readonly notifier: NotifierHandler;

  private readonly messageBus: Subscription;

  private readonly audioPlayer: AudioPlayer;

  public constructor(store: DefaultStore, notifier: NotifierHandler, messageBus: Subscription, audioPlayer: AudioPlayer) {
    this.store = store;
    this.logger = loggerFactory.getLogger("messageHelper");
    this.audioPlayer = audioPlayer;
    this.messageBus = messageBus;
    this.notifier = notifier;
  }

  public processUnknownP2pMessage(message: MessageModel) {
    if (message.userId !== this.store.myId) {
      this.processOpponentMessage(message);
    }
    this.store.addMessage(message);
    this.processAnyMessage();
  }

  public processAnyMessage() {
    this.messageBus.notify({
      action: "scroll",
      handler: "*",
    });
  }

  private processOpponentMessage(message: MessageModel) {
    const activeRoomId: number = this.store.activeRoom?.id!;
    const room = this.store.roomsDict[message.roomId];

    if (room.notifications) {
      const title = this.store.allUsersDict[message.userId].username;

      let icon: string = resolveMediaUrl(this.store.allUsersDict[message.userId].thumbnail) || faviconUrl;
      if (message.files) {
        const fff: FileModel = Object.values(message.files)[0];
        if (fff?.url) {
          icon = fff.url;
        }
      }
      this.notifier.showNotification(title, {
        body: message.content || "Image",
        replaced: 1,
        data: {
          replaced: 1,
          title,
          roomId: message.roomId,
        },
        requireInteraction: true,
        icon,
      });
    }
    if (!this.store.isCurrentWindowActive || activeRoomId !== message.roomId) {
      if (!message.deleted) {
        message.isHighlighted = true;
      }
    }

    if (this.store.userSettings!.messageSound) {
      this.audioPlayer.checkAndPlay(incoming, room.volume);
    }
  }
}
