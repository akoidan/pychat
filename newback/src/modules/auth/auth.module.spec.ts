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
  MailerService
} from '@nestjs-modules/mailer';
import {Sequelize} from 'sequelize-typescript';
import {HtmlService} from '@/modules/html/html.service';

describe('AuthModule', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let userRepository: UserRepository = {} as UserRepository;
  let roomRepository: RoomRepository = {} as RoomRepository;
  let redisService: RedisService = {} as RedisService;
  let sequelize: Sequelize = {} as Sequelize;
  let mailerService: MailerService = {} as MailerService;

  beforeAll(async() => {
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
    request = supertest(app.getHttpServer());
  });

  afterEach(() => {
    jest.clearAllMocks();
    Object.keys(userRepository).forEach(key => delete userRepository[key]);
    Object.keys(roomRepository).forEach(key => delete roomRepository[key]);
    Object.keys(redisService).forEach(key => delete redisService[key]);
    Object.keys(sequelize).forEach(key => delete sequelize[key]);
    Object.keys(mailerService).forEach(key => delete mailerService[key]);
  });

  afterAll(async() => {
   await app.close()
  });

  describe('signup', () => {
    it('returns session', async() => {
     sequelize.transaction = (resolve) =>resolve();
     userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
     userRepository.createUser = jest.fn().mockResolvedValue(3);
     roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
     redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      const {body} = await request
        .post('/register').send({
          username: 'a',
          password: 'as$'
        }).expect(201);

      expect(body).toMatchObject({session: expect.any(String)});
    });
    it('throws an error if user exists', async() => {
     sequelize.transaction = (resolve) =>resolve();
     userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);
      const {body} = await request
        .post('/register').send({
          username: 'a',
          password: 'as$'
        }).expect(409,{
        error: "Conflict",
        message: "User with this username already exist",
        statusCode: 409
      });
    });
    it('throws an error if email exists', async() => {
     sequelize.transaction = (resolve) =>resolve();
     userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
     userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(true);
      const {body} = await request
        .post('/register').send({
          username: 'a',
          password: 'as$',
          email: 'death@gmail.com'
        }).expect(409, {
        error: "Conflict",
        message: "User with this email already exist",
        statusCode: 409
      });
    });
  });
  describe('validate user', () => {

    it('should return ok', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      await request
        .post('/validate_user').send({
          username: 'a',
        }).expect(201,{});
    });
   it('should error if user exists', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);
      await request
        .post('/validate_user').send({
          username: 'a',
        }).expect(409,{
        "error": "Conflict",
        "message": "User with this username already exist",
        "statusCode": 409,
      });
    });
    it('should give error on invalid character for username', async() => {
      await request
        .post('/validate_user').send({
          username: '%',
        }).expect(400,{
        "error": "Bad Request",
        "message": [
          "Username can only contain latin characters, numbers and symbols '-' '_'",
        ],
        "statusCode": 400,
      });
    });
    it('should give error if username has great length', async() => {
      await request
        .post('/validate_user').send({
          username: '1234567890123456789',
        }).expect(400, {
        "error": "Bad Request",
        "message": [
          "Username should be 1-16 characters",
        ],
        "statusCode": 400,
      });
    });
    it('should throw an error if user exists', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);
      await request
        .post('/validate_user').send({
          username: 'asd',
        }).expect(409, {
        "error": "Conflict",
        "message": "User with this username already exist",
        "statusCode": 409,
      });
    });
  });
});
