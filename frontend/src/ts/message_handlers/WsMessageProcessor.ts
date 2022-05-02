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
import AbstractMessageProcessor from "@/ts/message_handlers/AbstractMessageProcessor";
import type Subscription from "@/ts/classes/Subscription";
import type {MessageSupplier} from "@/ts/types/types";
import type {DefaultStore} from "@/ts/classes/DefaultStore";
import type {ResponseWsInMessage,} from "@common/ws/common";
import type {GrowlWsInMessage,} from "@common/ws/message/growl.message";

export class WsMessageProcessor extends AbstractMessageProcessor {
  private readonly sub: Subscription;

  public constructor(target: MessageSupplier, store: DefaultStore, label: string, sub: Subscription) {
    super(target, store, label);
    this.sub = sub;
  }

  public handleMessage<D>(data: unknown) {
    const responseWsInMessage: ResponseWsInMessage<D> = data as ResponseWsInMessage<D>;
    const growlErrorMessage: GrowlWsInMessage = data as GrowlWsInMessage;
    if (responseWsInMessage.cbId &&
      this.callBacks[responseWsInMessage.cbId] &&
      (!responseWsInMessage.cbBySender || responseWsInMessage.cbBySender === this.target.getWsConnectionId())
    ) {
      this.logger.debug("resolving cb")();
      if (growlErrorMessage.action === "growlError") {
        this.callBacks[growlErrorMessage.cbId].reject(Error(growlErrorMessage.data.error));
      } else {
        this.callBacks[responseWsInMessage.cbId].resolve(responseWsInMessage.data);
      }
      delete this.callBacks[responseWsInMessage.cbId];
    } else if (growlErrorMessage.action === "growlError") {
      // GrowlError is used only in case above, so this is just a fallback that will never happen
      this.store.growlError((data as unknown as GrowlWsInMessage).data.error);
    } else {
      this.sub.notify(data);
    }
  }

  // TODO
  // public parseMessage<D>(jsonData: string): DefaultWsInMessage<string, HandlerName, D> | null | ResponseWsInMessage<D> {
  //   const data: DefaultWsInMessage<string, HandlerName, D> | null| ResponseWsInMessage<D> = super.parseMessage(jsonData);
  //   if ((data as DefaultWsInMessage<string, HandlerName, D>)?.handler !== "void" && (!data?.handler || !data.action)) {
  //     this.logger.error("Invalid message structure")();
  //
  //     return null;
  //   }
  //   return data;
  // }
}
