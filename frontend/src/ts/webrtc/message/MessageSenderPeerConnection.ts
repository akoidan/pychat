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
import MessagePeerConnection from "@/ts/webrtc/message/MessagePeerConnection";

export default class MessageSenderPeerConnection extends MessagePeerConnection {
  public makeConnection() {
    if (this.status !== "not_inited") {
      return;
    }
    this.status = "inited";
    this.createPeerConnection();
    // This.store.setSendingFileStatus(ssfs);
    try {
      // Reliable data channels not supported by Chrome
      this.sendChannel = this.pc!.createDataChannel("sendDataChannel", {reliable: false});
      this.setupEvents();
      this.logger.log("Created send data channel.")();
    } catch (e: any) {
      const error = `Failed to create data channel because ${e.message || e}`;
      this.logger.error("acceptFile {}", e)();

      return;
    }
    this.createOffer();
  }
}
