import {Module} from "@nestjs/common";
import {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {WebsocketService} from "@/modules/api/websocket/websocket.service";
import {SessionService} from '@/modules/rest/session/session.service';
import {PasswordService} from '@/modules/rest/password/password.service';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {DatabaseModule} from '@/modules/rest/database/database.module';
import {PubsubService} from '@/modules/rest/pubsub/pubsub.service';
import {WsDataService} from '@/modules/api/websocket/ws.data.service';
import {MessageService} from '@/modules/api/websocket/message.service';


@Module({
  imports:[DatabaseModule],
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
