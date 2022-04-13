import {
  Injectable,
  Logger
} from '@nestjs/common';
import {PasswordService} from '@/modules/rest/password/password.service';
import {RedisService} from '@/modules/rest/redis/redis.service';

@Injectable()
export class SessionService {

  constructor(
    private readonly passwordService: PasswordService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
  }

  public async createAndSaveSession(userId: number) {
    let session = await this.passwordService.generateRandomString(32);
    this.logger.log(`Generated session for userId ${userId}: ${session}`)
    await this.redisService.saveSession(session, userId);
    return session;
  }
}
