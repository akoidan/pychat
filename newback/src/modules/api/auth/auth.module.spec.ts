import {
  INestApplication,
  Logger,
  ValidationPipe
} from '@nestjs/common';
import * as supertest from 'supertest';
import {Test} from '@nestjs/testing';
import {AuthService} from '@/modules/api/auth/auth.service';
import {AuthController} from '@/modules/api/auth/auth.controller';
import {LoggerModule} from '@/modules/logger/logger.module';
import {PasswordService} from '@/modules/api/auth/password.service';
import {UserRepository} from '@/data/database/repository/user.repository';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {RedisService} from '@/data/redis/RedisService';
import {EmailService} from '@/modules/email/email.service';
import {MailerService} from '@nestjs-modules/mailer';
import {Sequelize} from 'sequelize-typescript';
import {HtmlService} from '@/modules/html/html.service';
import waitForExpect from "wait-for-expect";
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {OAuth2Client} from 'google-auth-library';
import {HttpService} from '@/modules/http/http.service';
import fetch from 'node-fetch';
import * as googleResponseFixture from '@/fixtures/google.response.fixture.json';
import * as facebookGetTokenResponseFixture from '@/fixtures/facebook.get.token.response.json';
import * as facebookGetUserResponseFixture from '@/fixtures/facebook.get.user.response.json';
import {ConfigService} from '@/modules/config/config.service';
import {
  config,
  IConfig
} from 'node-ts-config';
import {FacebookAuthService} from '@/modules/api/auth/facebook.auth.service';

describe('AuthModule', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let userRepository: UserRepository = {} as UserRepository;
  let roomRepository: RoomRepository = {} as RoomRepository;
  let redisService: RedisService = {} as RedisService;
  let sequelize: Sequelize = {} as Sequelize;
  let mailerService: MailerService = {} as MailerService;
  let oauth2Client: OAuth2Client = {} as OAuth2Client;
  let nodeApply: (...args) => void = () => {
  };
  let configService: ConfigService = {} as ConfigService;
  beforeAll(async() => {
    //required to compile Guards like CaptchaGuard
    configService.getConfig = jest.fn().mockReturnValue(config)
    const moduleFixture = await Test.createTestingModule({
      imports: [
        LoggerModule,
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: MailerService,
          useValue: mailerService
        },
        {
          provide: Sequelize,
          useValue: sequelize
        },
        {
          provide: HttpService,
          inject: [Logger],
          useFactory: (logger) => new HttpService(logger, new Proxy(() => {
          }, {
            apply: function (target: {}, thisArg: any, argArray: any[]): any {
              return nodeApply(...argArray)
            }
          }) as typeof fetch)
        },
        {
          provide: GoogleAuthService,
          inject: [Logger],
          useFactory: (logger) => new GoogleAuthService(logger, oauth2Client)
        },
        PasswordService,
        AuthService,
        HtmlService,
        EmailService,
        FacebookAuthService,
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
      ],
      controllers: [AuthController]
    })
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    request = supertest(app.getHttpServer());
  });

  beforeEach(() => {
    configService.getConfig = jest.fn().mockReturnValue(config)
  })

  afterEach(() => {
    jest.clearAllMocks();
    Object.keys(userRepository).forEach(key => delete userRepository[key]);
    Object.keys(roomRepository).forEach(key => delete roomRepository[key]);
    Object.keys(redisService).forEach(key => delete redisService[key]);
    Object.keys(sequelize).forEach(key => delete sequelize[key]);
    Object.keys(mailerService).forEach(key => delete mailerService[key]);
    Object.keys(oauth2Client).forEach(key => delete oauth2Client[key]);
    nodeApply = () => {
    };
    Object.keys(configService).forEach(key => delete configService[key]);

  });

  afterAll(async() => {
    await app.close()
  });

  describe('sign-in', () => {
    it('should throw if user not exists', async() => {
      userRepository.getUserByUserName = jest.fn().mockResolvedValue(null);
      await request
        .post('/api/auth/sign-in').send({
          username: 'a',
          password: 'as$'
        }).expect(409, {
          error: "Conflict",
          message: "User with login doesn't exists",
          statusCode: 409
        });
    });
    it('should throw exception that captcha missing', async() => {
      configService.getConfig = jest.fn().mockReturnValue({
        recaptcha: {
          publicKey: "a",
          privateKey: "a",
        }
      } as IConfig)
      const {body} = await request
        .post('/api/auth/sign-in').send({
          username: 'a',
          password: 'as$'
        }).expect(400, {
          statusCode: 400,
          message: 'Captcha is missing',
          error: 'Bad Request'
        });
    })
    it('should go throw captcha when its presnt', async() => {
      let passwordService = app.get(PasswordService);
      redisService.saveSession = jest.fn().mockResolvedValue(undefined);
      let password = await passwordService.createPassword("koko");
      userRepository.getUserByUserName = jest.fn().mockResolvedValue({
        userAuth: {
          password: password
        },
        id: 3
      })
      configService.getConfig = jest.fn().mockReturnValue({
        recaptcha: {
          publicKey: "a",
          privateKey: "a",
        }
      } as IConfig);
      nodeApply = jest.fn().mockReturnValue({json: jest.fn().mockResolvedValue({success: true})});
      const {body} = await request
        .post('/api/auth/sign-in').send({
          username: 'a',
          password: 'koko',
          captcha: 'asd'
        });
      expect(body).toMatchObject({session: expect.any(String)});
    })

    it('should throw if password invalid', async() => {
      userRepository.getUserByUserName = jest.fn().mockResolvedValue({
        userAuth: {
          password: 's'
        },
        id: 3
      })
      const {body} = await request
        .post('/api/auth/sign-in').send({
          username: 'a',
          password: 'as$'
        }).expect(401, {
          error: "Unauthorized",
          message: "Invalid password",
          statusCode: 401
        });
    })
    it('should return session', async() => {
      let passwordService = app.get(PasswordService);
      redisService.saveSession = jest.fn().mockResolvedValue(undefined);
      let password = await passwordService.createPassword("koko");
      userRepository.getUserByUserName = jest.fn().mockResolvedValue({
        userAuth: {
          password: password
        },
        id: 3
      })
      const {body} = await request
        .post('/api/auth/sign-in').send({
          username: 'a',
          password: 'koko'
        });
      expect(body).toMatchObject({session: expect.any(String)});
    })
  });

  describe('google-sign-in', () => {
    it('should login if user exists', async() => {
      sequelize.transaction = (resolve) => resolve();
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      userRepository.getUserMyAuthGoogle = jest.fn().mockResolvedValue({
        id: 1,
        user: {
          username: 'as'
        }
      });
      oauth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(googleResponseFixture)
      });
      const {body} = await request
        .post('/api/auth/google-sign-in').send({
          token: 'aasdasd',
        }).expect(201);
      expect(body).toMatchObject({
        session: expect.any(String),
        isNewAccount: false,
      })
    });
    it('should create a new user when email is new and user with email not exist', async() => {
      sequelize.transaction = (resolve) => resolve('transaction');
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      userRepository.getUserMyAuthGoogle = jest.fn().mockResolvedValue(null);
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(false);
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      userRepository.createUser = jest.fn().mockResolvedValue(3);
      roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
      let createUserSpy = jest.spyOn(userRepository, 'createUser');
      oauth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(googleResponseFixture)
      });
      const {body} = await request
        .post('/api/auth/google-sign-in').send({
          token: 'aasdasd',
        }).expect(201);
      expect(body).toMatchObject({
        session: expect.any(String),
        isNewAccount: true,
        username: 'death' // from fixture
      })
      expect(createUserSpy).toHaveBeenCalledWith(expect.objectContaining({
        "email": "death@gmail.com",
        "googleId": "death@gmail.com",
        "name": "Andrew",
        "password": expect.any(String),
        "sex": "OTHER",
        "surname": "Superman",
        "thumbnail": "https://lh3.googleusercontent.com/a-/xxxxxxxxxxxx-xxxxxxxxxxxx",
        "username": "death",
      }), 'transaction')
    });
    it('should throw an error if email exists', async() => {
      sequelize.transaction = (resolve) => resolve();
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      userRepository.getUserMyAuthGoogle = jest.fn().mockResolvedValue(null);
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(true);
      // userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      // userRepository.createUser = jest.fn().mockResolvedValue(3);
      // roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
      oauth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(googleResponseFixture)
      });
      const {body} = await request
        .post('/api/auth/google-sign-in').send({
          token: 'aasdasd',
        }).expect(409);
      expect(body).toMatchObject({
        error: "Conflict",
        statusCode: 409,
        message: "User with this email already exist, but has no connected google account." +
          " If this is you, please login as this user and connect this google profile in profile settings",
      })
    });
  });

  describe('facebook-sign-in', () => {
    it('should login if user exists', async() => {
      sequelize.transaction = (resolve) => resolve();
      redisService.saveSession = jest.fn().mockResolvedValue(undefined);
      nodeApply = jest.fn()
        .mockReturnValueOnce({json: jest.fn().mockResolvedValue(facebookGetTokenResponseFixture)})
        .mockReturnValueOnce({json: jest.fn().mockResolvedValue(facebookGetUserResponseFixture)});
      configService.getConfig = jest.fn().mockReturnValue({
        auth: {
          facebook: {
            accessToken: "test"
          }
        }
      } as IConfig)
      userRepository.getUserMyAuthFacebook = jest.fn().mockResolvedValue({
        id: 1,
        user: {
          username: 'as'
        }
      });
      const {body} = await request
        .post('/api/auth/facebook-sign-in').send({
          token: 'aasdasd',
        }).expect(201);
      expect(body).toMatchObject({
        session: expect.any(String),
        isNewAccount: false,
      })
    });
    it('should create a new user when email is new and user with email not exist', async() => {
      sequelize.transaction = (resolve) => resolve('transaction');
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)

      nodeApply = jest.fn()
        .mockReturnValueOnce({json: jest.fn().mockResolvedValue(facebookGetTokenResponseFixture)})
        .mockReturnValueOnce({json: jest.fn().mockResolvedValue(facebookGetUserResponseFixture)});
      configService.getConfig = jest.fn().mockReturnValue({
        auth: {
          facebook: {
            accessToken: "test"
          }
        }
      } as IConfig)
      userRepository.getUserMyAuthFacebook = jest.fn().mockResolvedValue(null);

      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      userRepository.createUser = jest.fn().mockResolvedValue(3);
      roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
      let createUserSpy = jest.spyOn(userRepository, 'createUser');
      oauth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(googleResponseFixture)
      });
      const {body} = await request
        .post('/api/auth/facebook-sign-in').send({
          token: 'aasdasd',
        }).expect(201);
      expect(body).toMatchObject({
        session: expect.any(String),
        isNewAccount: true,
        username: 'Andrew_Koidan' // from fixture
      })
      expect(createUserSpy).toHaveBeenCalledWith(expect.objectContaining({
        "facebookId": "1096917160382471",
        "name": "Andrew",
        "password": expect.any(String),
        "sex": "OTHER",
        "surname": "Koidan",
        "username": "Andrew_Koidan"
      }), 'transaction')
    });
  });

  describe('sign-up', () => {
    it('returns session', async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      userRepository.createUser = jest.fn().mockResolvedValue(3);
      roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      const {body} = await request
        .post('/api/auth/sign-up').send({
          username: 'a',
          password: 'as$'
        }).expect(201);

      expect(body).toMatchObject({session: expect.any(String)});
    });
    it('sends an email', async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.createVerification = jest.fn().mockResolvedValue(undefined);
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(false);
      userRepository.createUser = jest.fn().mockResolvedValue(3);
      roomRepository.createRoomUser = jest.fn().mockResolvedValue(undefined);
      mailerService.sendMail = jest.fn();
      let spy = jest.spyOn(mailerService, 'sendMail').mockResolvedValue(true);
      redisService.saveSession = jest.fn().mockResolvedValue(undefined)
      const {body} = await request
        .post('/api/auth/sign-up').send({
          username: 'a',
          password: 'as$',
          email: 'death@gmail.com'
        }).expect(201);

      expect(body).toMatchObject({session: expect.any(String)});
      await waitForExpect(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      }, 30); // 30ms is more than enough
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({html: expect.any(String)}))

    });
    it('throws an error if user exists', async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);
      const {body} = await request
        .post('/api/auth/sign-up').send({
          username: 'a',
          password: 'as$'
        }).expect(409, {
          error: "Conflict",
          message: "User with this username already exist",
          statusCode: 409
        });
    });
    it('throws an error if email exists', async() => {
      sequelize.transaction = (resolve) => resolve();
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(true);
      const {body} = await request
        .post('/api/auth/sign-up').send({
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

  describe('validate-email', () => {

    it('should return ok', async() => {
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(false);
      await request
        .post('/api/auth/validate-email').send({
          email: 'blah@gmail.com',
        }).expect(201, {ok: true});
    });
    it('should error if email exists', async() => {
      userRepository.checkUserExistByEmail = jest.fn().mockResolvedValue(true);
      await request
        .post('/api/auth/validate-email').send({
          email: 'exist@gmail.com',
        }).expect(409, {
          "error": "Conflict",
          "message": "User with this email already exist",
          "statusCode": 409,
        });
    });
    it('should give error on invalid email', async() => {
      await request
        .post('/api/auth/validate-email').send({
          email: 'invalidemail',
        }).expect(400, {
          "error": "Bad Request",
          "message": [
            'email must be an email',
          ],
          "statusCode": 400,
        });
    });
  });
  describe('validate-user', () => {

    it('should return ok', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(false);
      await request
        .post('/api/auth/validate-user').send({
          username: 'a',
        }).expect(201, {ok: true});
    });
    it('should error if user exists', async() => {
      userRepository.checkUserExistByUserName = jest.fn().mockResolvedValue(true);
      await request
        .post('/api/auth/validate-user').send({
          username: 'a',
        }).expect(409, {
          "error": "Conflict",
          "message": "User with this username already exist",
          "statusCode": 409,
        });
    });
    it('should give error on invalid character for username', async() => {
      await request
        .post('/api/auth/validate-user').send({
          username: '%',
        }).expect(400, {
          "error": "Bad Request",
          "message": [
            "Username can only contain latin characters, numbers and symbols '-' '_'",
          ],
          "statusCode": 400,
        });
    });
    it('should give error on invalid and also correct ones', async() => {
      await request
        .post('/api/auth/validate-user').send({
          username: '%asfasdf',
        }).expect(400, {
          "error": "Bad Request",
          "message": [
            "Username can only contain latin characters, numbers and symbols '-' '_'",
          ],
          "statusCode": 400,
        });
    });
    it('should give error if username has great length', async() => {
      await request
        .post('/api/auth/validate-user').send({
          username: '1234567890123456789',
        }).expect(400, {
          "error": "Bad Request",
          "message": [
            "Username should be 1-16 characters",
          ],
          "statusCode": 400,
        });
    });
  });
});