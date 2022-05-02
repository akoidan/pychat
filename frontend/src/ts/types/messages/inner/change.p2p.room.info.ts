import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {ChangeDeviceType} from "@common/legacy";


export interface ChangeP2pRoomInfoMessageBody  {
  allowZeroSubscribers: true;
  changeType: ChangeDeviceType;
  roomId: number;
  userId: number | null;
}
export type ChangeP2pRoomInfoMessage = DefaultInnerSystemMessage<"changeDevices", "webrtc", ChangeP2pRoomInfoMessageBody>;
