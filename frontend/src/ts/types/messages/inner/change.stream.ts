import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface ChangeStreamMessageBody {
  newStream: MediaStream;
}
export type ChangeStreamMessage = DefaultInnerSystemMessage<"streamChanged", "peerConnection:*", ChangeStreamMessageBody>;
