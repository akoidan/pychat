import {
  ALL_ROOM_ID,
  MAX_USERNAME_LENGTH,
} from "@/data/consts";
import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {FaceBookAuthRequest} from "@common/http/auth/facebook.auth";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {
  SignInRequest,
  SignInResponse,
} from "@common/http/auth/sign.in";
import {ImageType} from '@common/model/enum/image.type';
import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import {Theme} from '@common/model/enum/theme';
import {VerificationType} from '@common/model/enum/verification.type';
import {GiphyDto} from '@common/model/dto/giphy.dto';
import {ChannelDto} from '@common/model/dto/channel.dto';
import {FileModelDto} from '@common/model/dto/file.model.dto';
import {LocationDto} from '@common/model/dto/location.dto';
import {MessageModelDto} from '@common/model/dto/message.model.dto';
import {RoomDto} from '@common/model/dto/room.dto';
import {UserDto} from '@common/model/dto/user.dto';
import {UserProfileDto} from '@common/model/dto/user.profile.dto';
import {UserSettingsDto} from '@common/model/dto/user.settings.dto';   ALL_ROOM_ID,
  MAX_USERNAME_LENGTH,
} from "@/data/consts";
import type {FacebookSignInResponse} from "@common/http/auth/facebook.sign.in";
import type {FaceBookAuthRequest} from "@common/http/auth/facebook.auth";
import type {GoogleSignInResponse} from "@common/http/auth/google.sign.in";
import type {GoogleAuthRequest} from "@common/http/auth/google.auth";
import type {
  SignUpRequest,
  SignUpResponse,
} from "@common/http/auth/sign.up";
import type {
  SignInRequest,
  SignInResponse,
} from "@common/http/auth/sign.in";
import {ImageType} from '@common/model/enum/image.type';
import {Gender} from '@common/model/enum/gender';
import {MessageStatus} from '@common/model/enum/message.status';
import {Theme} from '@common/model/enum/theme';
import {VerificationType} from '@common/model/enum/verification.type';
import {GiphyDto} from '@common/model/dto/giphy.dto';
import {ChannelDto} from '@common/model/dto/channel.dto';
import {FileModelDto} from '@common/model/dto/file.model.dto';
import {LocationDto} from '@common/model/dto/location.dto';
import {MessageModelDto} from '@common/model/dto/message.model.dto';
import {RoomDto} from '@common/model/dto/room.dto';
import {UserDto} from '@common/model/dto/user.dto';
import {UserProfileDto} from '@common/model/dto/user.profile.dto';
import {UserSettingsDto} from '@common/model/dto/user.settings.dto';import {AppModule} from "@/modules/app/app.module";
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
