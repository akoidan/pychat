import {NestFactory} from '@nestjs/core';
import {AppModule} from '@/modules/app/app.module';
import {config} from 'node-config-ts';
import {
  ConsoleLogger,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import {LoggerModule} from '@/modules/logger/logger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger))
  await app.listen(config.application.port);
}

bootstrap();
