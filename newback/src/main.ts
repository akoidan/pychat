import {NestFactory} from "@nestjs/core";
import {AppModule} from "@/modules/app/app.module";
import {config} from "node-ts-config";
import {
  Logger,
  ValidationPipe,
} from "@nestjs/common";
import {readFile} from "fs/promises";
import {WsAdapter} from "@/modules/rest/ws.adapter/ws.adapter";

async function bootstrap() {
  const key = await readFile(config.application.keyPath, "utf-8");
  const cert = await readFile(config.application.crtPath, "utf-8");

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
    cors: {
      allowedHeaders: ["x-requested-with", "session-id", "Content-Type"],
      methods: ["POST", "GET", "OPTIONS"],
      origin: "*",
    },
    httpsOptions: {
      key,
      cert,
    },
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useWebSocketAdapter(new WsAdapter((app as any).getUnderlyingHttpServer(), logger));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.application.port);
}

bootstrap();
