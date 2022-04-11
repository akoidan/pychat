import {
  ConflictException,
  Injectable,
  Logger
} from '@nestjs/common';
import {UserRepository} from '@/data/database/repository/user.repository';
import {PasswordService} from '@/modules/password/password.service';
import {
  SignUpRequest,
  SignUpResponse
} from '@/data/types/dto/dto';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {ALL_ROOM_ID} from '@/data/utils/consts';
import {RedisService} from '@/data/redis/RedisService';
import {EmailSenderService} from '@/modules/email.render/email.sender.service';
import {Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

@Injectable()
export class AuthService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailSenderService,
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
  }

  public async authorize(email: string): Promise<string> {
    let user = await this.userRepository.getUserByEmail(email);
    return user.user.username;
  }

  public async sendVerificationEmail(email: string, userId: number, username: string, ip: string) {
    try {
      await this.sequelize.transaction(async(t) => {
        let token = await this.passwordService.generateRandomString(32);
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
      let session = await this.passwordService.generateRandomString(32);
      await this.redisService.saveSession(session, userId);
      return {session, userId};
    });
    if (data.email) {
      void this.sendVerificationEmail(data.email, userId, data.username, ip);
    }
    return {session};
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
