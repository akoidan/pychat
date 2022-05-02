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
import {IS_ANDROID} from "@/ts/utils/consts";
import type {
  permissions_type,
  PlatformUtil,
} from "@/ts/types/model";
import loggerFactory from "@/ts/instances/loggerFactory";
import type {Logger} from "lines-logger";

export class AndroidPlatformUtil implements PlatformUtil {
  private readonly logger: Logger;

  public constructor() {
    this.logger = loggerFactory.getLogger("native");
  }

  public async askPermissions(...askedPermissions: permissions_type): Promise<void> {
    if (IS_ANDROID) {
      const {permissions} = window.cordova.plugins as any;
      let requiredPermissions: permissions_type = [];
      if (askedPermissions.includes("audio")) {
        requiredPermissions.push(permissions.MODIFY_AUDIO_SETTINGS, permissions.RECORD_AUDIO);
      }
      if (askedPermissions.includes("video")) {
        requiredPermissions.push(permissions.CAMERA);
      }
      if (!askedPermissions.length) {
        throw Error("no persmissins asked");
      }
      this.logger.debug("Checking if user already has permissions for {}", permissions)();
      await requiredPermissions.map(async(permission) => new Promise<void>((resolve, reject) => {
        permissions.checkPermission(permission, (status: any) => {
          this.logger.debug("permission {} status {}", permission, status)();
          if (status.hasPermission) {
            requiredPermissions = requiredPermissions.filter((a) => a === permission);
          }
          resolve();
        }, reject);
      }));

      if (!requiredPermissions.length) {
        this.logger.debug("Permissions {} are already acquired", permissions)();
      } else {
        this.logger.debug("Asking  {} permissions", permissions)();
        await new Promise<void>((resolve, reject) => {
          permissions.requestPermissions(requiredPermissions, (status: any) => {
            if (!status.hasPermission) {
              reject("User rejected permissions");
            } else {
              resolve();
            }
          }, () => {
            reject("Internal error, cannot get user permissions");
          });
        });
        this.logger.debug("Permissions {} granted", permissions)();
      }
    }
  }
}
