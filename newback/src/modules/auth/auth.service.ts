import {
  ConflictException,
  Injectable
} from '@nestjs/common';
import {UserRepository} from '@/data/database/repository/user.repository';
import {PasswordService} from '@/modules/password/password.service';
import {SignUpRequest} from '@/data/types/dto/dto';
import {RoomRepository} from '@/data/database/repository/room.repository';
import {ALL_ROOM_ID} from '@/data/utils/consts';
import {RedisService} from '@/data/redis/RedisService';
import {EmailService} from '@/modules/email/email.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository,
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {
  }

  public async authorize(email: string): Promise<string> {
    let user = await this.userRepository.getUserByEmail(email);
    return user.user.username;
  }

  private async createUser(data: SignUpRequest) {
    await this.validateUser(data.username);
    if (data.email) {
      await this.validateEmail(data.email)
    }
    const password = await this.passwordService.createPassword(data.password);
    let userId = await this.userRepository.createUser({...data, password})
    await this.roomRepository.createRoomUser(ALL_ROOM_ID, userId);
    return userId;
  }

  public async registerUser(data: SignUpRequest) {
    let userId = await this.createUser(data);
    let session = await this.passwordService.generateRandomString(32);
    await this.redisService.saveSession(session, userId);
    if (data.email) {
       let token = await this.passwordService.generateRandomString(32);
       await this.userRepository.createVerification(data.email, userId, token)
       await this.emailService.sendSignUpEmail(data.username, data.email, token)
    }
    return session;
  }

  public async validateEmail(email: string): Promise<void> {
    let exist = await this.userRepository.checkUserExistByEmail(email);
    if (exist) {
      throw new ConflictException("User with this email already exist");
    }
  }

  public async validateUser(userName: string): Promise<void> {
    let exist = await this.userRepository.checkUserExistByUserName(userName);
    if (exist) {
      throw new ConflictException("User with this username already exist");
    }
  }
}
