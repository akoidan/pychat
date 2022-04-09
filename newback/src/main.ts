import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/modules/app/app.module';
import { config } from 'node-config-ts';
import {
  ConsoleLogger,
  ValidationPipe
} from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(config.application.port);
}
bootstrap();
