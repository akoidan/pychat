import {Injectable} from '@nestjs/common';
import {REDIS_SESSIONS_KEY} from '@/utils/consts';
import {
  InjectRedis,
  Redis
} from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService {

  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {
  }


  public async saveSession(session: string, userId: number): Promise<void> {
    await this.redis.hset(REDIS_SESSIONS_KEY, session, userId);
  }

}
