import type {
  DefaultWsInMessage,
  HandlerName,
} from "@/data/types/frontend";
import {
  DefaultInMessage,
} from "@/data/types/frontend";
import {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";

export interface PubSubMessage<A extends string, H extends HandlerName> {
  body: DefaultWsInMessage<A, H>;
}

/*
 * Export interface SendToClientPubSubMessage<A extends string, H extends HandlerName> extends PubSubMessage<A, H>{
 * }
 */
export type SendToClientPubSubMessage<DATA extends DefaultWsInMessage<A, H>, A extends string, H extends HandlerName> = PubSubMessage<A, H>;
