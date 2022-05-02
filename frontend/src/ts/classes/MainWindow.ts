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
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";

const LAST_TAB_ID_VARNAME = "lastTabId";

export class MainWindow {
  private readonly currentTabId: string;

  private unloaded: boolean = false;

  private readonly store: DefaultStore;

  private readonly logger: Logger;

  public constructor(store: DefaultStore) {
    window.addEventListener("beforeunload", this.onUnload.bind(this));
    window.addEventListener("unload", this.onUnload.bind(this));
    window.addEventListener("blur", this.onFocusOut.bind(this));
    window.addEventListener("focus", this.onFocus.bind(this));
    this.currentTabId = Date.now().toString();
    this.markCurrentTabAsMain();
    this.logger = loggerFactory.getLogger("mainWindow");
    this.store = store;
  }

  public onFocus() {
    localStorage.setItem(LAST_TAB_ID_VARNAME, this.currentTabId);
    this.store.setIsCurrentWindowActive(true);
  }

  public onFocusOut() {
    this.store.setIsCurrentWindowActive(false);
    this.logger.debug("Deactivating current tab")();
  }

  public markCurrentTabAsMain() {
    localStorage.setItem(LAST_TAB_ID_VARNAME, this.currentTabId);
  }

  public onUnload() {
    if (this.unloaded) {
      return;
    }
    if (this.isTabMain()) {
      localStorage.removeItem(LAST_TAB_ID_VARNAME);
    }
    this.unloaded = true;
  }


  public isTabMain() {
    let activeTab = localStorage.getItem(LAST_TAB_ID_VARNAME);
    if (!activeTab) {
      localStorage.setItem(LAST_TAB_ID_VARNAME, this.currentTabId);
      activeTab = this.currentTabId;
    }

    return activeTab === this.currentTabId;
  }
}
