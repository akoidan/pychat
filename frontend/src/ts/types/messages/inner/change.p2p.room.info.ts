import type {ChangeDeviceType} from "@common/model/ws.base";


import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";


export interface ChangeP2pRoomInfoMessageBody {
  allowZeroSubscribers: true;
  changeType: ChangeDeviceType;
  roomId: number;
  userId: number | null;
}
export type ChangeP2pRoomInfoMessage = DefaultInnerSystemMessage<"changeDevices", "webrtc", ChangeP2pRoomInfoMessageBody>;
