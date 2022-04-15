import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Module
} from '@nestjs/common';
import {RedisModule} from '@nestjs-modules/ioredis';
import {config} from 'node-ts-config';
import {WebsocketGateway} from '@/modules/api/websocket/websocket.gateway';
import {RedisService} from '@/modules/rest/redis/redis.service';
import {SessionService} from '@/modules/rest/session/session.service';
import {PasswordService} from '@/modules/rest/password/password.service';
import {DatabaseModule} from '@/modules/rest/database/database.module';
import {PubsubService} from '@/modules/rest/pubsub/pubsub.service';
import {WebsocketService} from '@/modules/api/websocket/websocket.service';
import {WsDataService} from '@/modules/api/websocket/ws.data.service';
import {APP_FILTER} from '@nestjs/core';
import {MessageService} from '@/modules/api/websocket/message.service';



@Module({
  imports: [
    {
      module: WebsocketGateway,
      imports: [DatabaseModule],
      providers: [
        WebsocketService,
        RedisService,
        PubsubService,
        MessageService,
        SessionService,
        WsDataService,
        PasswordService,
      ]
    },
    RedisModule.forRoot({
      config: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.database,
      }
    })],
})
export class WebsocketModule {
}
