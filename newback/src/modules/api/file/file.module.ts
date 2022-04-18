import {Module} from "@nestjs/common";
import {DatabaseModule} from "@/modules/rest/database/database.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {FileController} from "@/modules/api/file/file.controller";
import {SessionService} from "@/modules/rest/session/session.service";
import {PasswordService} from "@/modules/rest/password/password.service";
import {RedisService} from "@/modules/rest/redis/redis.service";
import {ImageService} from "@/modules/api/file/image.service";
import {FileService} from "@/modules/api/file/file.service";

@Module({
  imports: [
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "..", "..", "photos"),
      serveRoot: "/photo",
    }),
  ],
  controllers: [FileController],
  providers: [
    SessionService,
    RedisService,
    PasswordService,
    ImageService,
    FileService,
  ],
})
export class FileModule {
}
