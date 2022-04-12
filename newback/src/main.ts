import {NestFactory} from '@nestjs/core';
import {AppModule} from '@/modules/app/app.module';
import {config} from 'node-ts-config';
import {
  ConsoleLogger,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import {readFile} from 'fs';
import {promisify} from 'util';

async function bootstrap() {
  const key  = await promisify(readFile)(config.application.keyPath, 'utf-8');
  const cert =await promisify(readFile)(config.application.crtPath, 'utf-8');

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
    cors: {
      allowedHeaders: ["x-requested-with", "session_id", "Content-Type"],
      methods: ["POST", "GET", "OPTIONS"],
      origin: "*"
    },
    httpsOptions: {
       key,
       cert
    }
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger))
  await app.listen(config.application.port);
}

bootstrap();
