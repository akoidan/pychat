import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import {PasswordService} from "@/modules/rest/password/password.service";
import {RedisService} from "@/modules/rest/redis/redis.service";
import {UserRepository} from "@/modules/rest/database/repository/user.repository";
import type {UserModel} from "@/data/model/user.model";

@Injectable()
export class SessionService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {
  }

  public async createAndSaveSession(userId: number) {
    const session = await this.passwordService.generateRandomString(32);
    this.logger.log(`Generated session for userId ${userId}: ${session}`, "session.service");
    await this.redisService.saveSession(session, userId);
    return session;
  }

  public async getUserBySessionId(sessionId: string): Promise<UserModel> {
    const userId = await this.getUserIdBySession(sessionId);
    const user = await this.userRepository.getById(userId, ["userProfile", "userAuth", "userSettings"]);
    if (!user) {
      await this.redisService.removeSession(sessionId);
      throw new InternalServerErrorException("Database has been cleared this user is removed");
    }
    return user;
  }

  public async getUserIdBySession(sessionId: string): Promise<number> {
    if (!sessionId) {
      throw new UnauthorizedException("sessionId is missing");
    }
    const userId = await this.redisService.getSession(sessionId);
    if (!userId) {
      throw new UnauthorizedException("Session id expired");
    }
    return userId;
  }
}
