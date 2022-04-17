import type {
  DefaultWsInMessage,
  HandlerName,
} from "@/data/types/frontend";

export interface PubSubMessage<A extends string, H extends HandlerName> {
  body: DefaultWsInMessage<A, H>;
}

/*
 * Export interface SendToClientPubSubMessage<A extends string, H extends HandlerName> extends PubSubMessage<A, H>{
 * }
 */
export type SendToClientPubSubMessage<DATA extends DefaultWsInMessage<A, H>, A extends string, H extends HandlerName> = PubSubMessage<A, H>;
