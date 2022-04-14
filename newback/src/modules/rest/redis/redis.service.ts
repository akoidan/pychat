import {Injectable} from '@nestjs/common';
import {
  REDIS_KEYS,
} from '@/utils/consts';
import {
  InjectRedis,
  Redis
} from '@nestjs-modules/ioredis';
import {UserOnlineData} from '@/data/types/internal';

@Injectable()
export class RedisService {

  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {
  }


  public async saveSession(session: string, userId: number): Promise<void> {
    await this.redis.hset(REDIS_KEYS.REDIS_SESSIONS_KEY, session, userId);
  }

  public async removeSession(session: string) {
    await this.redis.hdel(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
  }

  public async getSession(session: string): Promise<number | null> {
    let a = await this.redis.hget(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
    if (!a) {
      return null;
    }
    return parseInt(a);
  }

  public async addOnline(id: string): Promise<void> {
    this.redis.sadd(REDIS_KEYS.REDIS_ONLINE_KEY, id)
  }

  public async getOnline(): Promise<UserOnlineData> {
    let data = await this.redis.smembers(REDIS_KEYS.REDIS_ONLINE_KEY);
    if (!data) {
      return {};
    }

    return data.reduce((set, currentValue) => {
      let [userId, id] = currentValue.split(':');
      if (!set[userId]) {
        set[userId] = []
      }
      set[userId].push(id)
      return set;
    }, {} as UserOnlineData);

  }


}
