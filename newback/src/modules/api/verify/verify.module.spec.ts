import type {INestApplication} from "@nestjs/common";
import {
  ConsoleLogger,
  Logger,
  ValidationPipe,
} from "@nestjs/common";
import * as supertest from "supertest";
import {Test} from "@nestjs/testing";
import {LoggerModule} from "@/modules/rest/logger/logger.module";
import {PasswordService} from "@/modules/rest/password/password.service";
import {UserRepository} from "@/modules/rest/database/repository/user.repository";
import type {RoomRepository} from "@/modules/rest/database/repository/room.repository";
import {RedisService} from "@/modules/rest/redis/redis.service";
import {EmailService} from "@/modules/rest/email/email.service";
import {MailerService} from "@nestjs-modules/mailer";
import {Sequelize} from "sequelize-typescript";
import {HtmlService} from "@/modules/rest/html/html.service";
import {HttpService} from "@/modules/rest/http/http.service";
import type fetch from "node-fetch";
import {ConfigService} from "@/modules/rest/config/config.service";
import {config} from "node-ts-config";
import {IpCacheService} from "@/modules/rest/ip/ip.cache.service";
import {IpService} from "@/modules/rest/ip/ip.service";
import {IpRepository} from "@/modules/rest/database/repository/ip.repository";
import type {IpAddressModel} from "@/data/model/ip.address.model";
import {VerificationRepository} from "@/modules/rest/database/repository/verification.repository";
import {VerificationType} from "@/data/types/frontend";
import {VerifyController} from "@/modules/api/verify/verify.controller";
import {VerifyService} from "@/modules/api/verify/verify.service";
import {SessionService} from "@/modules/rest/session/session.service";

describe("VerifyModule", () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  const userRepository: UserRepository = {} as UserRepository;
  const verificationRepository: VerificationRepository = {} as VerificationRepository;
  const ipRepository: IpRepository = {} as IpRepository;
  const roomRepository: RoomRepository = {} as RoomRepository;
  const redisService: RedisService = {} as RedisService;
  const sequelize: Sequelize = {} as Sequelize;
  const mailerService: MailerService = {} as MailerService;
  const configService: ConfigService = {} as ConfigService;
  beforeAll(async() => {
    // Required to compile Guards like CaptchaGuard
    configService.getConfig = jest.fn().mockReturnValue(config);
    const moduleFixture = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        PasswordService,
        HtmlService,
        SessionService,
        VerifyService,
        EmailService,
        IpCacheService,
        IpService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
        {
          provide: Sequelize,
          useValue: sequelize,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: VerificationRepository,
          useValue: verificationRepository,
        },
        {
          provide: IpRepository,
          useValue: ipRepository,
        },
        {
          provide: HttpService,
          inject: [Logger],
          useFactory: (logger) => new HttpService(logger, new Proxy(() => {
          }, {
            apply(target: {}, thisArg: any, argArray: any[]): any {
              throw Error("Unsupported");
            },
          }) as typeof fetch),
        },
      ],
      controllers: [VerifyController],
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
    Object.keys(userRepository).forEach((key) => delete userRepository[key]);
    Object.keys(roomRepository).forEach((key) => delete roomRepository[key]);
    Object.keys(redisService).forEach((key) => delete redisService[key]);
    Object.keys(sequelize).forEach((key) => delete sequelize[key]);
    Object.keys(mailerService).forEach((key) => delete mailerService[key]);
    Object.keys(ipRepository).forEach((key) => delete ipRepository[key]);
    Object.keys(configService).forEach((key) => delete configService[key]);
    Object.keys(verificationRepository).forEach((key) => delete configService[key]);
  });

  afterAll(async() => {
    await app.close();
  });

  describe("send-restore-password", () => {
    it("sends password when by username", async() => {
      configService.getConfig = jest.fn().mockReturnValue({
        ...config,
        email: {},
      });
      sequelize.transaction = (resolve) => resolve();
      userRepository.getUserByUserName = jest.fn().mockResolvedValue({
        userAuth: {
          email: "asd",
        },
        id: 3,
        username: "forpassword",
      });
      verificationRepository.createVerification = jest.fn().mockResolvedValue(undefined);
      mailerService.sendMail = jest.fn();
      const spy = jest.spyOn(mailerService, "sendMail");
      ipRepository.getIp = jest.fn().mockResolvedValue({
        country: "Ukraine",
        city: "Mariupol",
        isp: "AZOV",
      } as IpAddressModel);

      await request.post("/api/verify/send-restore-password").send({
        username: "a",
      }).
        expect(201, {ok: true});
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({html: expect.stringContaining("You have requested to change password on")}));
    });
    it("sends password when by email", async() => {
      configService.getConfig = jest.fn().mockReturnValue({
        ...config,
        email: {},
      });
      sequelize.transaction = (resolve) => resolve();
      userRepository.getUserByEmail = jest.fn().mockResolvedValue({
        email: "asd",
        user: {
          id: 3,
          username: "forpassword",
        },
      });
      verificationRepository.createVerification = jest.fn().mockResolvedValue(undefined);
      mailerService.sendMail = jest.fn();
      const spy = jest.spyOn(mailerService, "sendMail");
      ipRepository.getIp = jest.fn().mockResolvedValue({
        country: "Ukraine",
        city: "Mariupol",
        isp: "AZOV",
      } as IpAddressModel);

      await request.post("/api/verify/send-restore-password").send({
        email: "a@gmail.com",
      }).
        expect(201, {ok: true});
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({html: expect.stringContaining("You have requested to change password on")}));
    });
    it("throws an error if user doesnt exists", async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.getUserByUserName = jest.fn().mockResolvedValue(null);
      await request.post("/api/verify/send-restore-password").send({
        username: "a@gmail.com",
      }).
        expect(400, {
          statusCode: 400,
          message: "User with this username doesnt exit",
          error: "Bad Request",
        });
    });
  });
  describe("verify-token", () => {
    it("should return error when token doesnt exist", async() => {
      verificationRepository.getVerification = jest.fn().mockResolvedValue(undefined);

      await request.post("/api/verify/verify-token").send({
        token: "a",
      }).
        expect(400, {
          statusCode: 400,
          message: "Invalid token",
          error: "Bad Request",
        });
    });
    it("should return ok when token valid", async() => {
      verificationRepository.getVerification = jest.fn().mockResolvedValue({
        type: VerificationType.PASSWORD,
        createdAt: new Date(),
        user: {
          username: "a",
        },
      });

      await request.post("/api/verify/verify-token").send({
        token: "a",
      }).
        expect(201, {
          ok: true,
          username: "a",
        });
    });
    it("throws an error if user doesnt exists", async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.getUserByUserName = jest.fn().mockResolvedValue(null);
      await request.post("/api/verify/send-restore-password").send({
        username: "a@gmail.com",
      }).
        expect(400, {
          statusCode: 400,
          message: "User with this username doesnt exit",
          error: "Bad Request",
        });
    });
  });

  describe("confirm-email", () => {
    it("should return error when token doesnt exist", async() => {
      sequelize.transaction = (resolve) => resolve();
      verificationRepository.getVerification = jest.fn().mockResolvedValue(undefined);

      await request.post("/api/verify/confirm-email").send({
        token: "a",
      }).
        expect(400, {
          statusCode: 400,
          message: "Invalid token",
          error: "Bad Request",
        });
    });
    it("should set email confirmed", async() => {
      sequelize.transaction = (resolve) => resolve();
      verificationRepository.markVerificationVerified = jest.fn().mockResolvedValue(undefined);
      verificationRepository.setUserVerification = jest.fn().mockResolvedValue(undefined);
      verificationRepository.getVerification = jest.fn().mockResolvedValue({
        type: VerificationType.REGISTER,
        createdAt: new Date(),
        user: {
          username: "a",
        },
      });

      await request.post("/api/verify/confirm-email").send({
        token: "a",
      }).
        expect(201, {ok: true});
    });
  });
  describe("accept-token", () => {
    it("should return error when token doesnt exist", async() => {
      sequelize.transaction = (resolve) => resolve();
      verificationRepository.getVerification = jest.fn().mockResolvedValue(undefined);

      await request.post("/api/verify/accept-token").send({
        token: "a",
        password: "asd",
      }).
        expect(400, {
          statusCode: 400,
          message: "Invalid token",
          error: "Bad Request",
        });
    });
    it("should set email confirmed", async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.updateUserPassword = jest.fn().mockResolvedValue(undefined);
      verificationRepository.markVerificationVerified = jest.fn().mockResolvedValue(undefined);
      verificationRepository.setUserVerification = jest.fn().mockResolvedValue(undefined);
      redisService.saveSession = jest.fn().mockResolvedValue(undefined);
      verificationRepository.getVerification = jest.fn().mockResolvedValue({
        type: VerificationType.PASSWORD,
        createdAt: new Date(),
        user: {
          username: "a",
          password: "asd",
        },
      });

      const {body} = await request.post("/api/verify/accept-token").send({
        token: "a",
        password: "asd",
      }).
        expect(201);
      expect(body).toMatchObject({session: expect.any(String)});
    });
  });
});
