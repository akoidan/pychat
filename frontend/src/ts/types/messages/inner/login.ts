import type {DefaultInnerSystemMessage} from "@/ts/types/messages/helper";

export interface LoginMessageBody {
  session: string;
}

export type LoginMessage = DefaultInnerSystemMessage<"login", "router", LoginMessageBody>;
