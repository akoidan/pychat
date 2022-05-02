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
import loggerFactory from "@/ts/instances/loggerFactory";
import {isChrome} from "@/ts/utils/runtimeConsts";

const logger = loggerFactory.getLogger("home");

export async function canBeInstalled() {
  if (!isChrome) {
    return false;
  }
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return false;
  }
  if ("getInstalledRelatedApps" in window.navigator) {
    const relatedApps = await (navigator as any).getInstalledRelatedApps();
    return relatedApps.length === 0;
  }
  return true;
}

export async function addToHomeScreen() {
  // Show the prompt
  if (!window.deferredPrompt) {
    throw Error("This platform doesn't support Home applications");
  }
  await window.deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const choiceResult = await window.deferredPrompt.userChoice;
  if (choiceResult.outcome === "accepted") {
    logger.log("User accepted the A2HS prompt")();
  } else {
    logger.log("User dismissed the A2HS prompt")();
  }
}
