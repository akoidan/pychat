import {DefaultWsInMessage, HandlerName} from "@common/ws/common";

export interface DefaultInnerSystemMessage<A extends string, H extends HandlerName, D> extends DefaultWsInMessage<A, H, D> {
  // If true, no errors should be present on handeling this message by sucrcription if nothing was notified
  allowZeroSubscribers?: boolean;
}
