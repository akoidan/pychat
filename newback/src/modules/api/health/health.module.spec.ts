import type {INestApplication} from "@nestjs/common";
import {
  ConsoleLogger,
  ValidationPipe,
} from "@nestjs/common";
import * as supertest from "supertest";
import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/shared/logger/logger.module";
import {ConfigService} from "@/modules/shared/config/config.service";
import {config} from "node-ts-config";
import {HealthController} from "@/modules/api/health/health.controller";
import {HealthService} from "@/modules/api/health/health.service";
import {HealthRepository} from "@/modules/shared/database/repository/health.repository";
import {Sequelize} from "sequelize-typescript";

describe("AuthModule", () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  const healthRepository: HealthRepository = {} as HealthRepository;
  const sequelize: Sequelize = {} as Sequelize;
  const configService: ConfigService = {} as ConfigService;
  beforeAll(async() => {
    // Required to compile Guards like CaptchaGuard
    configService.getConfig = jest.fn().mockReturnValue(config);
    const moduleFixture = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        HealthService,
        {
          provide: HealthRepository,
          useValue: healthRepository,
        },
        {
          provide: Sequelize,
          useValue: sequelize,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
      controllers: [HealthController],
    }).setLogger(new ConsoleLogger()).
      compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    request = supertest(app.getHttpServer());
  });

  beforeEach(() => {
    configService.getConfig = jest.fn().mockReturnValue(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Object.keys(healthRepository).forEach((key) => delete healthRepository[key]);
    Object.keys(configService).forEach((key) => delete configService[key]);
  });

  afterAll(async() => {
    await app.close();
  });

  describe("sign-in", () => {
    it("should throw if user not exists", async() => {
      healthRepository.getTables = jest.fn().mockResolvedValue(["user", "message", "migration"]);
      (sequelize.models as any) = {user: 1,
        message: 2};
      await request.get("/api/health").send().
        expect(200, {tables: 3});
    });
  });
});
