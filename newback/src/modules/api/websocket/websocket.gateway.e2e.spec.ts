import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {IpService} from "@/modules/shared/ip/ip.service";
import {HttpModule} from "@/modules/shared/http/http.module";
import {WebsocketGateway} from "@/modules/api/websocket/websocket.gateway";
import {LoggerModule} from "@/modules/shared/logger/logger.module";
import {SessionService} from "@/modules/shared/session/session.service";
import {PasswordService} from "@/modules/shared/password/password.service";
import {IpCacheService} from "@/modules/shared/ip/ip.cache.service";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {DatabaseModule} from "@/modules/shared/database/database.module";
import {RedisModule} from "@nestjs-modules/ioredis";
import {config} from "node-ts-config";
import {ConsoleLogger} from "@nestjs/common";
import {UserRepository} from "@/modules/shared/database/repository/user.repository";
import {AuthModule} from "@/modules/api/auth/auth.module";
import {AuthService} from "@/modules/api/auth/auth.service";
import {ConfigModule} from "@/modules/shared/config/config.module";


describe("WebsocketGateway", () => {
  let gateway: WebsocketGateway;
  let moduleFixture: TestingModule;
  beforeAll(
    async() => {
      moduleFixture = await Test.createTestingModule({
        imports: [
          {
            module: WebsocketGateway,
            imports: [
              LoggerModule,
              ConfigModule,
              AuthModule,
              HttpModule,
              DatabaseModule,
              RedisModule.forRoot({
                config: {
                  host: config.redis.host,
                  port: config.redis.port,
                  db: config.redis.database,
                },
              }),
            ],
            providers: [
              PasswordService,
              RedisService,
              IpCacheService,
              SessionService,
              IpService,
            ],
          },

        ],
      }).setLogger(new ConsoleLogger()).
        compile();

      gateway = moduleFixture.get(WebsocketGateway);
    }
  );

  afterAll(async() => {
    await moduleFixture.close();
  });

  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe("handleConnection", () => {
    it("should not throw an error", async() => {
      const authService = moduleFixture.get(AuthService);
      const userRepository = moduleFixture.get(UserRepository);
      const user = await userRepository.getUserByUserName("test");
      let userId;
      if (user) {
        userId = user.id;
      } else {
        userId = await authService.createUser({
          password: "test",
          username: "test",
        });
      }

      const sessionService = moduleFixture.get(SessionService);
      const session = await sessionService.createAndSaveSession(userId);
      const a = await gateway.handleConnection({
        _socket: {
          remoteAddress: "192.168.1.1",
        },
      } as any, {url: `/ws?id=&sessionId=${session}`} as any, {} as any);


      expect(1 + 1).toEqual(2);
    });
  });
});
