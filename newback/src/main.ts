import {NestFactory} from "@nestjs/core";
import {AppModule} from "@/modules/app/app.module";
import {config} from "node-ts-config";
import {
  Logger,
  ValidationPipe,
} from "@nestjs/common";
import {readFile} from "fs/promises";
import {WsAdapter} from "@/modules/shared/ws.adapter/ws.adapter";
import type {HttpsOptions} from "@nestjs/common/interfaces/external/https-options.interface";

async function bootstrap() {
  let httpsOptions: HttpsOptions = null;
  if (config.application.ssl) {
    httpsOptions = {};
    httpsOptions.key = await readFile(config.application.ssl.keyPath, "utf-8");
    httpsOptions.cert = await readFile(config.application.ssl.crtPath, "utf-8");
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
    cors: {
      allowedHeaders: ["session-id", "Content-Type"],
      methods: ["POST", "GET", "OPTIONS"],
      origin: "*",
    },
    httpsOptions,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useWebSocketAdapter(new WsAdapter((app as any).getUnderlyingHttpServer(), logger));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.application.port);
}

bootstrap();
