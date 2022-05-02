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
import ChatCall from "@/assets/sounds/Call.mp3";
import ChatIncoming from "@/assets/sounds/ChatIncoming.wav";
import ChatLogin from "@/assets/sounds/ChatLogin.wav";
import ChatLogout from "@/assets/sounds/ChatLogout.wav";
import ChatOutgoing from "@/assets/sounds/ChatOutgoing.wav";
import ChatFile from "@/assets/sounds/File.mp3";


function createAudio(url: string) {
  const audio = new Audio();
  audio.preload = "none";
  audio.src = url;
  return audio;
}

export const call = createAudio(ChatCall);
export const incoming = createAudio(ChatIncoming);
export const login = createAudio(ChatLogin);
export const logout = createAudio(ChatLogout);
export const outgoing = createAudio(ChatOutgoing);
export const file = createAudio(ChatFile);
