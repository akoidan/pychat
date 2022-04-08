import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";
import {extractError} from "@/ts/utils/pureFunctions";
import type Api from "@/ts/message_handlers/Api";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {
  GIT_HASH,
  IS_DEBUG,
  SERVICE_WORKER_URL,
  SERVICE_WORKER_VERSION_LS_NAME,
} from "@/ts/utils/consts";
import type {
  HandlerType,
  HandlerTypes,
} from "@/ts/types/messages/baseMessagesInterfaces";
import type {InternetAppearMessage} from "@/ts/types/messages/innerMessages";
import MessageHandler from "@/ts/message_handlers/MesageHandler";
import type {MainWindow} from "@/ts/classes/MainWindow";
import type Subscription from "@/ts/classes/Subscription";


export default class NotifierHandler extends MessageHandler {
  protected readonly logger: Logger;

  protected readonly handlers: HandlerTypes<keyof Api, "*"> = {
    internetAppear: <HandlerType<"internetAppear", "*">> this.internetAppear,
  };

  private readonly mainWindow: MainWindow;

  private readonly popedNotifQueue: Notification[] = [];


  /* This is required to know if this tab is the only one and don't spam with same notification for each tab*/
  private serviceWorkedTried = false;

  private serviceWorkerRegistration: any = null;

  private subscriptionId: string | null = null;

  private newMessagesCount: number = 0;

  private readonly store: DefaultStore;

  private readonly api: Api;

  private readonly browserVersion: string;

  private readonly isChrome: boolean;

  private readonly isMobile: boolean;

  private readonly ws: WsHandler;

  private readonly documentTitle: string;

  private readonly sub: Subscription;

  public constructor(api: Api, browserVersion: string, isChrome: boolean, isMobile: boolean, ws: WsHandler, store: DefaultStore, mainWindow: MainWindow, sub: Subscription) {
    super();
    this.api = api;
    this.browserVersion = browserVersion;
    this.isChrome = isChrome;
    this.isMobile = isMobile;
    this.ws = ws;
    this.mainWindow = mainWindow;
    this.documentTitle = document.title;
    this.store = store;
    this.sub = sub;
    this.logger = loggerFactory.getLogger("notify");
    window.addEventListener("focus", this.onFocus.bind(this));
    this.sub.subscribe("notifier", this);
    this.onFocus(null);
  }

  public async internetAppear(p: InternetAppearMessage) {
    if (!this.serviceWorkedTried) {
      await this.tryAgainRegisterServiceWorker();
    }
  }

  public replaceIfMultiple(data: {title: string; options: NotificationOptions}) {
    let count = 1;
    const newMessData = data.options.data;
    if (newMessData && newMessData.replaced) {
      this.popedNotifQueue.forEach((e: Notification) => {
        if (e.data && e.data.title === newMessData.title || e.title === newMessData.title) {
          count += e.replaced || e.data.replaced;
          e.close();
        }
      });
      if (count > 1) {
        newMessData.replaced = count;
        data.title = `${newMessData.title}(+${count})`;
      }
    }
  }

  /**
   * @return true if Permissions were asked and user granted them
   *
   */
  public async checkPermissions() {
    if ((<any>Notification).permission !== "granted") { // TODO
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        throw Error("User blocked notification permission. Notifications won't be available");
      }

      return true;
    }

    return false;
  }

  public async tryAgainRegisterServiceWorker() {
    try {
      if (!(<any>window).Notification) {
        throw Error("Notifications are not supported");
      }
      const granted = await this.checkPermissions();
      if (granted) {
        await this.showNot("Pychat notifications are enabled", {
          body: "You can disable them in room's settings",
          replaced: 1,
        });
      }
      if (!this.serviceWorkedTried) {
        await this.registerWorker();
      }
    } catch (e) {
      this.logger.error("Error registering service worker {}", extractError(e))();
    } finally {
      this.serviceWorkedTried = true;
    }
  }

  public async showNotification(title: string, options: NotificationOptions) {
    if (this.store.isCurrentWindowActive) {
      return;
    }
    this.newMessagesCount++;
    document.title = `${this.newMessagesCount} new messages`;
    try {
      navigator.vibrate(200);
    } catch (e) {
      this.logger.debug("Vibration skipped, because ", e);
    }
    // Last opened tab not this one, leave the oppotunity to show notification from last tab
    if (!(<any>window).Notification ||
      !this.mainWindow.isTabMain()) {
      return;
    }
    await this.checkPermissions();
    await this.showNot(title, options);
  }

  public onFocus(e: Event | null) {
    if (e) {
      this.logger.debug("Marking current tab as active, pinging server")();
      if (this.store.userInfo && this.ws.isWsOpen() && !IS_DEBUG) {
        this.ws.pingServer(); // If no event = call from init();
      }
    } else {
      this.logger.debug("Marking current tab as active")();
    }
    this.newMessagesCount = 0;
    document.title = this.documentTitle;
    this.popedNotifQueue.forEach((n) => {
      n.close();
    });
  }


  // Permissions are granted here!
  private async showNot(title: string, options: NotificationOptions) {
    this.logger.debug("Showing notification {} {}", title, options);
    if (this.serviceWorkerRegistration && this.isMobile && this.isChrome) {

      /*
       * TODO  options should contain page id here but it's not
       * so we open unfefined url
       */
      const r = await this.serviceWorkerRegistration.showNotification(title, options);
      this.logger.debug("res {}", r)(); // TODO https://stackoverflow.com/questions/39717947/service-worker-notification-promise-broken#comment83407282_39717947
    } else {
      const data = {
        title,
        options,
      };
      this.replaceIfMultiple(data);
      const not = new Notification(data.title, data.options);
      if (data.options.replaced) {
        not.replaced = data.options.replaced;
      }
      this.popedNotifQueue.push(not);
      not.onclick = () => {
        window.focus();
        if (not.data && not.data.roomId) {
          this.store.setActiveRoomId(parseInt(not.data.roomId));
        }
        not.close();
      };
      not.onclose = () => {
        this.popedNotifQueue.splice(this.popedNotifQueue.indexOf(not), 1);
      };
      this.logger.debug("Notification {} {} has been spawned, current queue {}", title, options, this.popedNotifQueue)();
    }
  }

  private async registerWorker() {
    if (!navigator.serviceWorker) {
      throw Error("Service worker is not supported");
    } else if (!SERVICE_WORKER_URL) {
      throw Error("FIREBASE_API_KEY is missing in settings.py or file manifest.json is missing");
    }

    let r: ServiceWorkerRegistration = (await navigator.serviceWorker.getRegistration())!;
    const version = localStorage.getItem(SERVICE_WORKER_VERSION_LS_NAME) || "";
    if (version !== GIT_HASH || !r) {
      this.logger.log(`Updating sw {} version ${version} to ${GIT_HASH}`, r)();
      r = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {scope: "/"});
      if (r) {
        this.logger.debug("Registered service worker {}", r)();
        this.logger.log(`Registered SW ${GIT_HASH} {}`, r)();
        localStorage.setItem(SERVICE_WORKER_VERSION_LS_NAME, `${GIT_HASH}`);
      } else {
        this.logger.error("Registered failed somehow", r)();
        throw Error("Sw registration failed");
      }
    } else {
      this.logger.log(`SW is up to date, v=${version} {}, skipping the update`, r)();
    }

    this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
    this.logger.debug("Service worker is ready {}", this.serviceWorkerRegistration)();

    const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true});
    if (!subscription) {
      throw Error("Check permissions");
    }
    this.logger.log("Got subscription {}", subscription)();

    this.subscriptionId = subscription.toJSON() as string;
    if (!this.subscriptionId) {
      throw Error("Current browser doesnt support offline notifications");
    }

    if (subscription.endpoint && subscription.endpoint.startsWith("https://fcm.googleapis.com/fcm/send")) {
      const registrationId = subscription.endpoint.split("/").pop();
      await this.api.registerFCB(registrationId, this.browserVersion, this.isMobile);
      this.logger.log("Saved subscription to server")();
    } else {
      this.logger.warn("Unsupported subscription type {}", subscription.endpoint)();
    }
  }
}
