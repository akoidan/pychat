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
