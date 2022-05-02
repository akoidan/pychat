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
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import type {MainWindow} from "@/ts/classes/MainWindow";


export class AudioPlayer {
  private readonly mainWindow: MainWindow;

  private readonly logger: Logger;

  public constructor(mainWindow: MainWindow) {
    this.mainWindow = mainWindow;
    this.logger = loggerFactory.getLogger("audio");
  }

  checkAndPlay(element: HTMLAudioElement, volume: number) {
    if (volume && this.mainWindow.isTabMain()) {
      try {
        element.pause();
        element.currentTime = 0;
        element.volume = volume * volume / 10_000;
        const prom = element.play();
        prom && prom.catch((e) => {
        });
      } catch (e) {
        this.logger.error("Skipping playing message, because {}", e)();
      }
    }
  }
}


