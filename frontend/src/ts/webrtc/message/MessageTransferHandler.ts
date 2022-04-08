import BaseTransferHandler from "@/ts/webrtc/BaseTransferHandler";
import type {
  MessageSender,
  UserIdConn,
} from "@/ts/types/types";
import type {RoomModel} from "@/ts/types/model";
import MessageSenderPeerConnection from "@/ts/webrtc/message/MessageSenderPeerConnection";
import MessageReceiverPeerConnection from "@/ts/webrtc/message/MessageReceiverPeerConnection";
import type WsHandler from "@/ts/message_handlers/WsHandler";
import type NotifierHandler from "@/ts/classes/NotificationHandler";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import Subscription from "@/ts/classes/Subscription";
import type {
  SendSetMessagesStatusMessage,
  SyncP2PMessage,
} from "@/ts/types/messages/innerMessages";
import type {HandlerTypes} from "@/ts/types/messages/baseMessagesInterfaces";
import type {MessageHelper} from "@/ts/message_handlers/MessageHelper";

/**
 *
 * https://drive.google.com/file/d/1BCtFNNWprfobqQlG4n2lPyWEqroi7nJh/view
 */
export default class MessageTransferHandler extends BaseTransferHandler implements MessageSender {
  protected readonly handlers: HandlerTypes<keyof MessageTransferHandler, "webrtc-message"> = {};

  private state: "initing" | "not_inited" | "ready" = "not_inited";

  private readonly messageHelper: MessageHelper;

  public constructor(roomId: number, wsHandler: WsHandler, notifier: NotifierHandler, store: DefaultStore, messageHelper: MessageHelper, sub: Subscription) {
    super(roomId, wsHandler, notifier, store, sub);
    this.messageHelper = messageHelper;
  }

  private get room(): RoomModel {
    return this.store.roomsDict[this.roomId];
  }

  private get connectionIds(): UserIdConn[] {
    if (!this.room) {
      return [];
    }
    const usersIds = this.room.users;
    const myConnectionId = this.wsHandler.getWsConnectionId();
    const connections = usersIds.reduce<UserIdConn[]>((connectionIdsWithUser, userId) => {
      const connectionIds: string[] = this.store.onlineDict[userId] ?? [];
      connectionIds.forEach((connectionId) => {
        if (connectionId !== myConnectionId) {
          connectionIdsWithUser.push({
            userId,
            connectionId,
          });
        }
      });
      return connectionIdsWithUser;
    }, []);
    this.logger.debug("Evaluated {} connectionIds", connections)();
    return connections;
  }

  async syncMessage(roomId: number, messageId: number): Promise<void> {
    this.messageHelper.processAnyMessage();
    if (this.state === "ready") {
      const payload: SyncP2PMessage = {
        action: "syncP2pMessage",
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        id: messageId,
        allowZeroSubscribers: true,
      };
      this.sub.notify(payload);
    }
  }

  public destroyThisTransferHandler() {
    this.sub.notify({
      action: "checkDestroy",
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
    });
  }

  public async init() {
    if (this.state === "not_inited") {
      this.state = "initing";
      try {
        const {connId} = await this.wsHandler.offerMessageConnection(this.roomId);
        if (!connId) {
          throw Error("Error during setting connection ID");
        }
        // @ts-expect-error: next-line
        if (this.state !== "ready") { // Already inited in another place, like in accept connection
          this.setConnectionId(connId);
          this.state = "ready";
          await this.refreshPeerConnections();
        }
      } catch (e) {
        this.state = "not_inited";
      }
    }
  }

  public async initOrSync() {
    // If state is initing, refresh connection will be triggered when it finishes
    if (this.state === "not_inited") { // If it's not inited , refresh connection wil trigger inside this init()
      await this.init();
    } else if (this.state === "ready") { // If it's ready, we should check if new devices appeard while we were offline
      this.refreshPeerConnections();
    }
  }

  public async acceptConnection({connId}: {connId: string}) {

    /*
     * If connection is initing, we make it ready, so init would not refresh connection again
     * if connection is not_inited, this assignments initializes it.
     * if connection is ready already, we should refresh the connection to create a new PeerConnection for opponent device
     */
    this.setConnectionId(connId);
    this.state = "ready";
    // This means user probably appears online, we should refresh connections
    this.refreshPeerConnections();
  }

  public refreshPeerConnections() {
    const myConnectionId = this.wsHandler.getWsConnectionId();
    const newConnectionIdsWithUser = this.connectionIds;
    newConnectionIdsWithUser.forEach((connectionIdWithUser) => {
      const opponentWsId = connectionIdWithUser.connectionId;
      if (this.sub.getNumberOfSubscribers(Subscription.getPeerConnectionId(this.connectionId!, opponentWsId)) == 0) {
        let mpc;
        if (opponentWsId > myConnectionId) {
          mpc = new MessageSenderPeerConnection(
            this.roomId,
            this.connectionId!,
            opponentWsId,
            this.wsHandler,
            this.store,
            connectionIdWithUser.userId,
            this.messageHelper,
            this.sub,
          );
        } else {
          mpc = new MessageReceiverPeerConnection(
            this.roomId,
            this.connectionId!,
            opponentWsId,
            this.wsHandler,
            this.store,
            connectionIdWithUser.userId,
            this.messageHelper,
            this.sub,
          );
        }
        mpc.makeConnection();
      }
    });
    // Let newConnectionIds: string[] = newConnectionIdsWithUser.map(a => a.connectionId);

    // Let connectionsToRemove = this.webrtcConnnectionsIds.filter(oldC => newConnectionIds.indexOf(oldC) < 0);
    this.sub.notify({
      action: "checkDestroy",
      handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
      allowZeroSubscribers: true,
    });
  }

  async loadThreadMessages(roomId: number, threadId: number): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();

    /*
     * This.store.growlError('The operation you\'re trying to do is not supported on p2p channel yet');
     * throw new Error('Method not implemented.');
     */
  }

  async loadUpSearchMessages(roomId: number, count: number): Promise<void> {
    throw new Error("Searching message is not supported on p2p direct channel yet");
  }

  public async markMessagesInCurrentRoomAsRead(roomId: number, messageIds: number[]) {
    this.messageHelper.processAnyMessage();
    if (this.state === "ready") {
      const payload: SendSetMessagesStatusMessage = {
        action: "sendSetMessagesStatus",
        handler: Subscription.allPeerConnectionsForTransfer(this.connectionId!),
        messageIds,
        status: "read",
        allowZeroSubscribers: true,
      };
      this.sub.notify(payload);
    }
  }

  async loadMessages(roomId: number, messageId: number[]): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();
  }

  async loadUpMessages(roomId: number, count: number): Promise<void> {
    this.logger.error("Method not implemented.")();
    return Promise.resolve();
  }
}
