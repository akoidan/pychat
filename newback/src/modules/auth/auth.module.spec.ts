import {
  INestApplication,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import * as supertest from 'supertest';
import {Test} from '@nestjs/testing';
import {AuthService} from '@/modules/auth/auth.service';
import {AuthController} from '@/modules/auth/auth.controller';
import {LoggerModule} from '@/modules/logger/logger.module';
import {PasswordService} from '@/modules/password/password.service';
import {UserRepository} from '@/data/database/repository/user.repository';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {RedisService} from '@/data/redis/RedisService';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {
  MailerModule,
  MailerService
} from '@nestjs-modules/mailer';
import {Sequelize} from 'sequelize-typescript';
import {HtmlService} from '@/modules/html/html.service';

describe('AuthModule', () => {
  let app: INestApplication;
  let request: () => supertest.SuperTest<supertest.Test>;
  let userRepository: UserRepository;
  let roomRepository: RoomRepository;
  let redisService: RedisService;
  let sequelize: Sequelize;
  let mailerService: MailerService;
  beforeEach(async() => {

    userRepository = {} as UserRepository;
    roomRepository = {} as RoomRepository;
    redisService = {} as RedisService;
    sequelize = {} as Sequelize;
    mailerService = {} as MailerService;
    const moduleFixture = await Test.createTestingModule({
      imports: [
        LoggerModule,
      ],
      providers: [
        {provide: MailerService, useValue: mailerService},
        {provide: Sequelize, useValue: sequelize},
        AuthService,
        HtmlService,
        EmailSenderService,
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
          provide: RoomRepository,
          useValue: roomRepository,
        },
        Logger,
        PasswordService,
      ],
      controllers: [AuthController]
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const requestToServer = supertest(app.getHttpServer());
    request = (): supertest.SuperTest<supertest.Test> => requestToServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => app.close());

  describe('signup', () => {
    it('validate request', async() => {
     sequelize.transaction = (resolve) =>resolve();
     userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
     userRepository.createUser = jest.fn().mockResolvedValue(3);
     roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
     redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      const {body} = await request()
        .post('/register').send({
          username: 'a',
          password: 'as$'
        });

      await expect(body).toMatchObject({session: expect.any(String)});
    });
  });
  describe('validate user', () => {
    it('should give error on invalid character for username', async() => {
      const {body} = await request()
        .post('/validate_user').send({
          username: '%',
        });

      await expect(body).toStrictEqual({
        "error": "Bad Request",
        "message": [
          "Username can only contain latin characters, numbers and symbols '-' '_'",
        ],
        "statusCode": 400,
      });
    });
    it('should give error if username has great length', async() => {
      const {body} = await request()
        .post('/validate_user').send({
          username: '1234567890123456789',
        });

      await expect(body).toStrictEqual({
        "error": "Bad Request",
        "message": [
          "Username should be 1-16 characters",
        ],
        "statusCode": 400,
      });
    });
    it('should throw an error if user exists', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);

      const {body} = await request()
        .post('/validate_user').send({
          username: 'asd',
        });

      await expect(body).toStrictEqual({
        "error": "Conflict",
        "message": "User with this username already exist",
        "statusCode": 409,
      });
    });
  });
});
