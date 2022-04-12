import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import {UserRepository} from '@/data/database/repository/user.repository';
import {PasswordService} from '@/modules/api/auth/password.service';
import {
  GoogleAuthRequest,
  GoogleSignInResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse
} from '@/data/types/dto/dto';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {ALL_ROOM_ID} from '@/data/utils/consts';
import {RedisService} from '@/data/redis/RedisService';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {GoogleAuthService} from '@/modules/api/auth/google.auth.service';
import {TokenPayload} from 'google-auth-library';

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
    let a: TokenPayload = await this.googleAuthService.validate(body.token);
   return this.sequelize.transaction(async(t) => {
    let userAuth = await this.userRepository.getUserMyAuthGoogle(a.email, t)
    if (userAuth) {
      let session = await this.createAndSaveSession(userAuth.id);
      return {session, isNewAccount: false, username: userAuth.user.username};
    } else {

    }
   });

    // let googleId = a.email;
    // 	response.get('given_name'),
		// 	response.get('family_name'),
		// 	email=response.get('email'),
		// 	picture=response.get('picture'),
		// 	google_id=response.get('id')

    // username = re.sub('[^0-9a-zA-Z-_]+', '-', email.rsplit('@')[0])[:15]
    // if email:
		// 		username = re.sub('[^0-9a-zA-Z-_]+', '-', email.rsplit('@')[0])[:15]
		// 	else:
		// 		username = f'{name}_{surname}'
    return undefined as any;
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
