import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";
import {HandlerName} from "@common/ws/common";

export interface ConnectToRemoteMessageBody {
  stream: MediaStream | null;
}
export type ConnectToRemoteMessage = DefaultInnerSystemMessage<"connectToRemote", HandlerName, ConnectToRemoteMessageBody>;
