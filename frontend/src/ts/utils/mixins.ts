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
import type {Logger} from "lines-logger";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {VueBase} from "vue-class-component";
import type {ComponentOptions} from "vue";

export const loggerMixin = {
  computed: {
    $logger(this: ComponentOptions): Logger {
      if (!this.__logger && this.$options._componentTag !== "router-link") {
        let {name} = this.$options;
        if (["RouterView", "RouterLink"].includes(name)) {
          return null as any;
        }
        const fileName = this.$options.__file;
        if (!name && fileName) {
          name = fileName.substr(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".") - fileName.lastIndexOf("/") - 1);
        }
        if (!name) {
          name = "vue-comp";
        }
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, "#35495e");
      }
      return this.__logger;
    },
  },
  updated(this: VueBase): void {
    this.$logger && this.$logger.debug("Updated")();
  },
  unmounted(this: VueBase) {
    this.$logger && this.$logger.debug("unmounted")();
  },
  created(this: VueBase) {
    this.$logger && this.$logger.debug("Created")();
  },
};

