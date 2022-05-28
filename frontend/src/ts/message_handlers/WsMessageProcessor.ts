import type {GrowlWsInMessage} from "@common/ws/message/growl.message";
import type {ResponseWsInMessage} from "@common/ws/common";
import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";
import type Subscription from "@/ts/classes/Subscription";
import {
  CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT,
  CONNECTION_RETRY_TIME,
} from "@/ts/utils/consts";
import {Subscribe} from "@/ts/utils/pubsub";
import type {LogoutMessage} from "@/ts/types/messages/inner/logout";
import {WS_SESSION_EXPIRED_CODE} from "@common/consts";
import {WsState} from "@/ts/types/model";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import {SessionHolder} from "@/ts/types/types";


export class WsMessageProcessor extends AbstractMessageProcessor {
  private wsState: WsState = WsState.NOT_INITED;

  private listenWsTimeout: number | null = null;

  private ws: WebSocket | null = null;

  private noServerPingTimeout: number | null = null;

  private readonly wsConnectionId = "";

  public constructor(
    private readonly apiUrl: string,
    private readonly sub: Subscription,
    private readonly store: DefaultStore,
    private readonly sessionHolder: SessionHolder,
  ) {
    super("ws");
  }

  private onWsClose(e: CloseEvent) {
    this.logger.log("Got onclose event")();
    this.ws = null;
    this.setStatus(false);
    // Tornado drops connection if exception occurs during processing an event we send from WsApi
    this.onDropConnection(e.code === 1006 ? "Server error" : "Connection to server is lost");

    /*
     * For (let k in this.progressInterval) {
     *   this.hideGrowlProgress(k);
     * }
     */
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.noServerPingTimeout = null;
    }
    const reason = e.reason || e;
    if (e.code === WS_SESSION_EXPIRED_CODE) {
      const message = `Server has forbidden request because '${reason}'. Logging out...`;
      this.logger.error("onWsClose {}", message)();
      this.store.growlError(message);
      const message1: LogoutMessage = {
        action: "logout",
        handler: "*",
      };
      this.sub.notify(message1);
      return;
    } else if (this.wsState === WsState.NOT_INITED) {
      // This.store.growlError( 'Can\'t establish connection with server');
      this.logger.warn("Chat server is down because {}", reason)();
      this.wsState = WsState.TRIED_TO_CONNECT;
    } else if (this.wsState === WsState.CONNECTED) {
      // This.store.growlError( `Connection to chat server has been lost, because ${reason}`);
      this.logger.error(
        "Connection to WebSocket has failed because \"{}\". Trying to reconnect every {}ms",
        e.reason,
        CONNECTION_RETRY_TIME,
      )();
    }
    if (this.wsState !== WsState.TRIED_TO_CONNECT) {
      this.wsState = WsState.CONNECTION_IS_LOST;
    }
    // Try to reconnect in 10 seconds
    this.listenWsTimeout = window.setTimeout(() => {
      this.listenWS();
    }, CONNECTION_RETRY_TIME);
  }

  private setStatus(isOnline: boolean) {
    this.store.setIsOnline(isOnline);
    this.logger.debug("Setting online to {}", isOnline)();
  }

  private onWsOpen() {
    this.setStatus(true);
    this.startNoPingTimeout();
    this.wsState = WsState.CONNECTED;
    this.logger.debug("Connection has been established")();
  }

  private listenWS() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = this.onWsMessage.bind(this);
    this.ws.onclose = this.onWsClose.bind(this);
    this.ws.onopen = this.onWsOpen.bind(this);
  }

  private onWsMessage(message: MessageEvent) {
    const data = this.parseMessage(message.data);
    if (data) {
      this.handleMessage(data);
    }
  }

  @Subscribe<LogoutMessage>()
  public logout() {
    const info = [];
    if (this.listenWsTimeout) {
      this.listenWsTimeout = null;
      info.push("purged timeout");
    }
    if (this.ws) {
      this.ws.onclose = null;
      info.push("closed ws");
      this.ws.close();
      this.ws = null;
    }
    this.logger.debug("Finished ws: {}", info.join(", "))();
  }

  private startNoPingTimeout() {
    if (this.noServerPingTimeout) {
      clearTimeout(this.noServerPingTimeout);
      this.logger.debug("Clearing noServerPingTimeout")();
      this.noServerPingTimeout = null;
    }
    this.noServerPingTimeout = setTimeout(() => {
      if (this.ws) {
        this.logger.error("Force closing socket coz server didn't ping us")();
        this.ws.close(1000, "Sever didn't ping us");
      }
    }, CLIENT_NO_SERVER_PING_CLOSE_TIMEOUT) as unknown as number;
  }

  sendRawTextToServer(message: string): boolean {
    if (this.isWsOpen()) {
      this.ws!.send(message);
      return true;
    }
    return false;
  }

  public isWsOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public handleMessage<D>(data: unknown) {
    const responseWsInMessage: ResponseWsInMessage<D> = data as ResponseWsInMessage<D>;
    const growlErrorMessage: GrowlWsInMessage = data as GrowlWsInMessage;
    if (responseWsInMessage.cbId &&
      this.callBacks[responseWsInMessage.cbId] &&
      (!responseWsInMessage.cbBySender || responseWsInMessage.cbBySender === this.wsConnectionId)
    ) {
      this.logger.debug("resolving cb")();
      if (growlErrorMessage.action === "growlError") {
        this.callBacks[growlErrorMessage.cbId].reject(Error(growlErrorMessage.data.error));
      } else {
        this.callBacks[responseWsInMessage.cbId].resolve(responseWsInMessage.data);
      }
      delete this.callBacks[responseWsInMessage.cbId];
    } else {
      this.sub.notify(responseWsInMessage);
    }
  }

  private get wsUrl() {
    return `${this.apiUrl}?id=${this.wsConnectionId}&sessionId=${this.sessionHolder.session}`;
  }

  setWsConnectionId(id: string) {
    return this.wsConnectionId;
  }

  public getWsConnectionId() {
    return this.wsConnectionId;
  }


  public async startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.log("Starting webSocket")();
      if (!this.listenWsTimeout && !this.ws) {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onmessage = this.onWsMessage.bind(this);
        this.ws.onclose = (e) => {
          setTimeout(() => {
            reject(Error("Cannot connect to websocket"));
          });
          this.onWsClose(e);
        };
        this.ws.onopen = () => {
          setTimeout(resolve);
          this.onWsOpen();
        };
      } else {
        resolve();
      }
    });
  }

}
