import {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface RouterNavigateMessageBody {
  to: string;
}

export type RouterNavigateMessage = DefaultInnerSystemMessage<"navigate", "router", RouterNavigateMessageBody>;
