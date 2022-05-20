import {HandlerName} from "@common/ws/common";
import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface ConnectToRemoteMessageBody {
  stream: MediaStream | null;
}
export type ConnectToRemoteMessage = DefaultInnerSystemMessage<"connectToRemote", HandlerName, ConnectToRemoteMessageBody>;
