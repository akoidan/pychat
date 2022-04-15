import {
  DefaultInMessage,
  DefaultWsInMessage,
  HandlerName
} from '@/data/types/frontend';
import {WebsocketGateway} from '@/modules/api/websocket/websocket.gateway';

export interface PubSubMessage<A extends string, H extends HandlerName> {
  content: DefaultWsInMessage<A, H>;
}

// export interface SendToClientPubSubMessage<A extends string, H extends HandlerName> extends PubSubMessage<A, H>{
// }
export interface SendToClientPubSubMessage<DATA extends DefaultWsInMessage<A,H>, A extends string, H extends HandlerName> extends PubSubMessage<A, H>{
}
