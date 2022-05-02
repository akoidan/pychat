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
import {IMessageHandler} from "@common/legacy";
import type {Logger} from "lines-logger";


export default abstract class MessageHandler implements IMessageHandler {
  protected abstract readonly logger: Logger;

  protected abstract readonly handlers: HandlerTypes<any, any>;

  public handle(message: DefaultInMessage<string, HandlerName>) {
    if (!this.handlers) {
      throw Error(`${this.constructor.name} has empty handlers`);
    }
    const handler: HandlerType<string, HandlerName> | undefined = this.handlers[message.action];
    if (handler) {
      handler.bind(this)(message);
      this.logger.debug("Notified {}.{} => message", this.constructor.name, message.action, message);
    } else {
      this.logger.error("{} can't find handler for {}, available handlers {}. Message: {}", this.constructor.name, message.action, Object.keys(this.handlers), message)();
    }
  }

  getHandler(message: DefaultInMessage<string, HandlerName>): HandlerType<string, HandlerName> | undefined {
    return this.handlers[message.action];
  }
}
