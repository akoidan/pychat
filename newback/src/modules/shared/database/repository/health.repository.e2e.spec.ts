import {DatabaseModule} from "@/modules/shared/database/database.module";
import {ConsoleLogger} from "@nestjs/common";
import type {TestingModule} from "@nestjs/testing";
import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/shared/logger/logger.module";
import {ConfigModule} from "@/modules/shared/config/config.module";
import {HealthRepository} from "@/modules/shared/database/repository/health.repository";


describe("HealthRepository", () => {
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
  describe("checkHealth", () => {
    it("should return ok", async() => {
      const healthRepository: HealthRepository = app.get(HealthRepository);
      let tables = await  healthRepository.getTables();
      expect(tables.length).toBeGreaterThan(2);
    });
  });
});
