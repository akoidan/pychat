import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import {UserRepository} from '@/data/database/repository/user.repository';
import {PasswordService} from '@/modules/api/auth/password.service';
import {
  AcceptTokenRequest,
  AcceptTokenResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  FaceBookAuthRequest,
  FacebookSignInResponse,
  Gender,
  GoogleAuthRequest,
  GoogleSignInResponse,
  SendRestorePasswordRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  VerificationType,
  VerifyTokenResponse
} from '@/data/types/frontend';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {
  ALL_ROOM_ID,
  MAX_USERNAME_LENGTH
} from '@/data/utils/consts';
import {RedisService} from '@/data/redis/RedisService';
import {EmailService} from '@/modules/util/email/email.service';
import {Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {TokenPayload} from 'google-auth-library';
import {generateUserName} from '@/data/utils/helpers';
import {FacebookAuthService} from '@/modules/api/auth/facebook.auth.service';
import {FacebookGetUserResponse} from '@/data/types/api';
import {VerificationModel} from '@/data/database/model/verification.model';

@Injectable()
export class AuthService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly facebookService: FacebookAuthService,
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
  }


  public async authorizeFacebook(body: FaceBookAuthRequest): Promise<FacebookSignInResponse> {
    let fbResponse: FacebookGetUserResponse = await this.facebookService.validate(body.token);
    return this.sequelize.transaction(async(t) => {
      let userAuth = await this.userRepository.getUserMyAuthFacebook(fbResponse.id, t)
      if (userAuth) {
        let session = await this.createAndSaveSession(userAuth.id);
        let response: GoogleSignInResponse = {session, isNewAccount: false};
        return response;
      } else {
        let username = generateUserName(`${fbResponse.first_name}_${fbResponse.last_name}`);
        if (await this.userRepository.checkUserExistByUserName(username)) {
          // the chance that there will be a user with same id is insignificant
          username = await this.passwordService.generateRandomString(MAX_USERNAME_LENGTH);
        }
        this.logger.log(`Generates username='${username}' for fbId ${fbResponse.id}`);
        const password = await this.passwordService.createPassword(await this.passwordService.generateRandomString(16));

        let userId = await this.userRepository.createUser({
          password,
          username,
          name: fbResponse.first_name,
          surname: fbResponse.last_name,
          sex: Gender.OTHER,
          facebookId: fbResponse.id
        }, t)
        await this.roomRepository.createRoomUser(ALL_ROOM_ID, userId, t);

        let session = await this.createAndSaveSession(userId);
        let response: GoogleSignInResponse = {session, isNewAccount: true, username};
        return response;
      }
    });
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
      const result = await this.userRepository.getUserByUserName(body.username, ['userAuth']);
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
        await this.userRepository.createVerification(email, userId, token, VerificationType.REGISTER, t)
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

  private doTokenVerification(data: VerificationModel, typ: VerificationType): void {
    if (!data) {
      throw new BadRequestException("Invalid token");
    }
    if (data.type != typ) {
      throw new BadRequestException("Invalid operation");
    }
    if (data.verified) {
      throw new BadRequestException("This token is already used");
    }
    if (Date.now() - data.createdAt.getTime() > 24 * 3600 * 1000) { // 24 hours
      throw new BadRequestException("This token is already expired");
    }
  }

  public async verifyToken(token: string): Promise<VerifyTokenResponse> {
    let verificationModel: VerificationModel = await this.userRepository.getVerification(token);
    //https://pychat.org/#/auth/proceed-reset-password?token=evhv0zum3l8gavzql4xk5u16q2h9gqd2
    this.doTokenVerification(verificationModel, VerificationType.PASSWORD)
    return {
      ok: true,
      username: verificationModel.user.username
    }
  }

  public async sendRestorePassword(body: SendRestorePasswordRequest, ip: string): Promise<void> {
    return this.sequelize.transaction(async(t) => {
      let email, userId, username;
      if (body.email) {
        const user = await this.userRepository.getUserByEmail(body.email, t);
        if (!user) {
          throw new BadRequestException("User with this email doesnt exit");
        }
        username = user.user.username;
        userId = user.id;
        email = body.email;
      } else if (body.username) {
        const user = await this.userRepository.getUserByUserName(body.username, ['userAuth'], t);
        if (!user) {
          throw new BadRequestException("User with this username doesnt exit");
        }
        if (!user.userAuth.email) {
          throw new BadRequestException("This user didnt specify an email");
        }
        email = user.userAuth.email;
        username = user.username;
        userId = user.id;
      }
      let token: string = await this.passwordService.generateRandomString(32);
      this.logger.log(`Generated token='${token}' to restore user email='${email}'`);
      await this.userRepository.createVerification(email, userId, token, VerificationType.PASSWORD, t)
      await this.emailService.sendRestorePasswordEmail(username, userId, email, token, ip, ip)
    });
  }

  public async acceptToken(body: AcceptTokenRequest): Promise<AcceptTokenResponse> {
    return this.sequelize.transaction(async(t) => {
      let verificationModel: VerificationModel = await this.userRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.PASSWORD);
      let password = await this.passwordService.createPassword(body.password);
      this.logger.log(`Generated newPassword='${password}' for verification='${verificationModel.id}' for userId=${verificationModel.userId}`);
      await this.userRepository.updateUserPassword(verificationModel.userId, password, t)
      await this.userRepository.markVerificationVerified(verificationModel.id, t);
      let session = await this.createAndSaveSession(verificationModel.userId);
      let result: AcceptTokenResponse = {
        session
      }
      return result;
    })
  }

  public async confirmEmail(body: ConfirmEmailRequest): Promise<void> {
     this.sequelize.transaction(async(t) => {
      let verificationModel: VerificationModel = await this.userRepository.getVerification(body.token, t);
      this.doTokenVerification(verificationModel, VerificationType.REGISTER);
      await this.userRepository.markVerificationVerified(verificationModel.id , t);
      await this.userRepository.setUserVerification(verificationModel.userId, verificationModel.id , t);
    })
  }
}
