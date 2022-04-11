import {Module} from '@nestjs/common';
import {AuthModule} from '@/modules/auth/auth.module';
import {DatabaseModule} from '@/data/database/database.module';
import {LoggingInterceptor} from '@/modules/logger/interceptor';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {LoggerModule} from '@/modules/logger/logger.module';
import {RedisModule} from '@nestjs-modules/ioredis';
import {config} from 'node-config-ts';

@Module({
  imports: [AuthModule, DatabaseModule, LoggerModule, RedisModule.forRoot({
    config: {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.database,
    }
  })],
  exports: [DatabaseModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
}
