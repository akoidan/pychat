import {DatabaseModule} from "@/modules/rest/database/database.module";
import {ConsoleLogger} from "@nestjs/common";
import type {
  TestingModule,
} from "@nestjs/testing";
import {
  Test,
} from "@nestjs/testing";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {ConfigModule} from "@/modules/rest/config/config.module";
import {MessageRepository} from "@/modules/rest/database/repository/messages.repository";

describe("MessageRepository", () => {
  let app: TestingModule;
  beforeAll(async() => {
    app = await Test.createTestingModule({
      imports: [
        {
          module: DatabaseModule,
          imports: [
            LoggerModule,
            ConfigModule,
            DatabaseModule,
          ],
        },

      ],
    }).setLogger(new ConsoleLogger()).
      compile();
  });
  describe("getNewMessagesFromRoom", () => {
    it("should produce correct sql", async() => {
      const mr: MessageRepository = app.get(MessageRepository);
      const result = await mr.getNewMessagesAfterSync([1, 2], [3, 4], 3600000);
    });
  });
  describe("getMessages2", () => {
    it("should produce correct sql", async() => {
      const mr: MessageRepository = app.get(MessageRepository);
      const result = await mr.getMessages2([1, 2], [3, 4]);
    });
  });
});
