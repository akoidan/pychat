import {Module} from "@nestjs/common";
import {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {WebsocketService} from "@/modules/api/websocket/websocket.service";
import {SessionService} from "@/modules/shared/session/session.service";
import {PasswordService} from "@/modules/shared/password/password.service";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {DatabaseModule} from "@/modules/shared/database/database.module";
import {PubsubService} from "@/modules/shared/pubsub/pubsub.service";
import {WsDataService} from "@/modules/api/websocket/ws.data.service";
import {MessageService} from "@/modules/api/websocket/message.service";


@Module({
  imports: [DatabaseModule],
  providers: [
    SessionService,
    WebsocketService,
    PasswordService,
    RedisService,
    PubsubService,
    WsDataService,
    MessageService,
    WebsocketGateway,
  ],
})
export class WebsocketModule {
}
