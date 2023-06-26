import {MessageStatus} from "@common/model/enum/message.status";
import {ConsoleLogger} from "@nestjs/common";
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {MessageRepository} from "@/modules/shared/database/repository/messages.repository";
import {RedisService} from "@/modules/shared/redis/redis.service";
import {RedisModule} from "@nestjs-modules/ioredis";
import {config} from "node-ts-config";
import {LoggerModule} from "@/modules/shared/logger/logger.module";
import {
  PubsubService,
  SubscribePuBSub,
} from "@/modules/shared/pubsub/pubsub.service";
import type {
  PubSubMessage,
  SendToClientPubSubMessage,
} from "@/data/types/internal";
import type {
  DefaultWsInMessage,
  HandlerName,
} from "@common/ws/common";
import {SubscribeMessage} from "@nestjs/websockets";
import type {WebSocketContextData} from "@/data/types/patch";
import waitForExpect from "wait-for-expect";
import {PubsubModule} from "@/modules/shared/pubsub/pubsub.module";

describe("PubSubService", () => {
  let app: TestingModule;
  let pubsubService: PubsubService;
  beforeAll(async() => {
    app = await Test.createTestingModule({
      imports: [
        LoggerModule,
        RedisModule.forRoot({
          config: {
            host: config.redis.host,
            port: config.redis.port,
            db: config.redis.database,
          },
        },),
        PubsubModule,
      ],
    }).setLogger(new ConsoleLogger()).
      compile();
    pubsubService = app.get(PubsubService);
  });
  describe("subscribe", () => {
    jest.setTimeout(1000000);
    it("should produce correct sql", async() => {
      let called = false;
      const message: PubSubMessage<"asd", "ws-message"> = {
        handler: "sendToClient",
        body: {
          action: "asd",
          data: {a: 3},
          handler: "ws-message",
        },
      };
      SubscribePuBSub("sendToClient")({
        sendToClient(ctx: WebSocketContextData, data: SendToClientPubSubMessage<any, any, any>) {
          console.log("asd");
          called = true;
        },
      } as any, "sendToClient", undefined);
      await pubsubService.subscribe({
        id: "asd",
        userId: 3,
        sendToClient<H extends HandlerName>(data: DefaultWsInMessage<any, H, any>) {
          console.log("asd");
        },
      }, "1");
      await pubsubService.emit(message, "1");
      await waitForExpect(() => {
        expect(called).toBe(true);
      }, 30000);
    });
  });
});
