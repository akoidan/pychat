import {Module} from '@nestjs/common';
import {AuthModule} from '@/modules/api/auth/auth.module';
import {LoggingInterceptor} from '@/modules/util/interceptors/logging.interceptor';
import {
  APP_INTERCEPTOR,
  RouterModule
} from '@nestjs/core';
import {LoggerModule} from '@/modules/util/logger/logger.module';
import {RedisModule} from '@nestjs-modules/ioredis';
import {config} from 'node-ts-config';
import {ConfigModule} from '@/modules/util/config/config.module';

@Module({
  imports: [AuthModule, LoggerModule, ConfigModule, RedisModule.forRoot({
    config: {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.database,
    }
  })],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
}
