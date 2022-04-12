import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import {UserRepository} from '@/data/database/repository/user.repository';
import {PasswordService} from '@/modules/api/auth/password.service';
import {
  Gender,
  GoogleAuthRequest,
  GoogleSignInResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse
} from '@/data/types/frontend';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {
  ALL_ROOM_ID,
  MAX_USERNAME_LENGTH
} from '@/data/utils/consts';
import {RedisService} from '@/data/redis/RedisService';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {TokenPayload} from 'google-auth-library';
import {generateUserName} from '@/data/utils/helpers';

@Injectable()
export class AuthService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailSenderService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
  }


  public async authorizeGoogle(body: GoogleAuthRequest): Promise<GoogleSignInResponse> {
    let googleResponse: TokenPayload = await this.googleAuthService.validate(body.token);
    return this.sequelize.transaction(async(t) => {
      let userAuth = await this.userRepository.getUserMyAuthGoogle(googleResponse.email, t)
      if (userAuth) {
        let session = await this.createAndSaveSession(userAuth.id);
        let response: GoogleSignInResponse = {session, isNewAccount: false};
        return response;
      } else {
        let username = generateUserName(googleResponse.email);
        if (await this.userRepository.checkUserExistByEmail(googleResponse.email)) {
          throw new ConflictException("User with this email already exist, but has no connected google account." +
            " If this is you, please login as this user and connect this google profile in profile settings")
        }
        if (await this.userRepository.checkUserExistByUserName(username)) {
          // the chance that there will be a user with same id is insignificant
          username = await this.passwordService.generateRandomString(MAX_USERNAME_LENGTH);
        }
        this.logger.log(`Generates username='${username}' for email ${googleResponse.email}`);
        const password = await this.passwordService.createPassword(await this.passwordService.generateRandomString(16));

        let userId = await this.userRepository.createUser({
          googleId: googleResponse.email,
          password,
          email: googleResponse.email,
          username,
          thumbnail: googleResponse.picture,
          name: googleResponse.given_name,
          surname: googleResponse.family_name,
          sex: Gender.OTHER,
        }, t)
        await this.roomRepository.createRoomUser(ALL_ROOM_ID, userId, t);

        let session = await this.createAndSaveSession(userId);
        let response: GoogleSignInResponse = {session, isNewAccount: true, username};
        return response;
      }
    });
  }

  public async authorize(body: SignInRequest): Promise<SignInResponse> {
    let password, userId;
    if (body.email) {
      const result = await this.userRepository.getUserByEmail(body.email);
      userId = result?.user?.id;
      password = result?.password;
    } else {
      const result = await this.userRepository.getUserByUserName(body.username);
      userId = result?.id;
      password = result?.userAuth?.password;
    }
    if (!password) {
      throw new ConflictException("User with login doesn't exists");
    }
    let matches = await this.passwordService.checkPassword(body.password, password);
    if (!matches) {
      throw new UnauthorizedException("Invalid password");
    }
    const session = await this.createAndSaveSession(userId);
    return {session}
  }

  public async sendVerificationEmail(email: string, userId: number, username: string, ip: string) {
    try {
      this.logger.debug(`Preparing for sending verification email to userId ${userId}`)
      await this.sequelize.transaction(async(t) => {
        let token = await this.passwordService.generateRandomString(32);
        this.logger.log(`Generated token for userId ${userId}: ${token}`)
        await this.userRepository.createVerification(email, userId, token, t)
        await this.emailService.sendSignUpEmail(username, userId, email, token, ip, ip)
      });
    } catch (e) {
      this.logger.error(`Can't send email to userid ${userId} ${email} because ${e.message}`, e.stack, 'Mail')
    }

  }

  public async registerUser(data: SignUpRequest, ip: string): Promise<SignUpResponse> {
    const {session, userId} = await this.sequelize.transaction(async(t) => {
      let userId = await this.createUser(data, t);
      let session = await this.createAndSaveSession(userId);
      return {session, userId};
    });
    if (data.email) {
      void this.sendVerificationEmail(data.email, userId, data.username, ip);
    }
    return {session};
  }

  private async createAndSaveSession(userId: number) {
    let session = await this.passwordService.generateRandomString(32);
    this.logger.log(`Generated session for userId ${userId}: ${session}`)
    await this.redisService.saveSession(session, userId);
    return session;
  }

  public async validateEmail(email: string): Promise<void> {
    let exist = await this.userRepository.checkUserExistByEmail(email);
    if (exist) {
      throw new ConflictException("User with this email already exist");
    }
  }

  public async validateUser(userName: string, transaction?: Transaction): Promise<void> {
    let exist = await this.userRepository.checkUserExistByUserName(userName, transaction);
    if (exist) {
      throw new ConflictException("User with this username already exist");
    }
  }

  private async createUser(data: SignUpRequest, transaction: Transaction) {
    await this.validateUser(data.username, transaction);
    if (data.email) {
      await this.validateEmail(data.email)
    }
    const password = await this.passwordService.createPassword(data.password);
    let userId = await this.userRepository.createUser({...data, password}, transaction)
    await this.roomRepository.createRoomUser(ALL_ROOM_ID, userId, transaction);
    return userId;
  }
}
