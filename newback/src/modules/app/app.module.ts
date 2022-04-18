import {Module} from "@nestjs/common";
import {AuthModule} from "@/modules/api/auth/auth.module";
import {LoggingInterceptor} from "@/modules/app/interceptors/logging.interceptor";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {RedisModule} from "@nestjs-modules/ioredis";
import {config} from "node-ts-config";
import {ConfigModule} from "@/modules/rest/config/config.module";
import {VerifyModule} from "@/modules/api/verify/verify.module";
import {DatabaseModule} from "@/modules/rest/database/database.module";
import {WebsocketModule} from "@/modules/api/websocket/websocket.module";
import {FileModule} from "@/modules/api/file/file.module";


/*
 * Import {
 *   ArgumentsHost,
 *   Catch,
 *   ExceptionFilter,
 *   HttpException
 * } from '@nestjs/common';
 *
 * @Catch(Error)
 * export class HttpExceptionFilter implements ExceptionFilter {
 *   catch(exception: HttpException, host: ArgumentsHost) {
 *     throw  exception;
 *   }
 * }
 */


@Module({
  imports: [
    AuthModule,
    LoggerModule,
    ConfigModule,
    VerifyModule,
    FileModule,
    DatabaseModule,
    WebsocketModule,
    RedisModule.forRoot({
      config: {
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.database,
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
}
