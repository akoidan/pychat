import {
  Injectable,
  Logger
} from '@nestjs/common';
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
    private readonly logger: Logger,
  ) {
  }


  public async saveSession(session: string, userId: number): Promise<void> {
    this.logger.debug(`hset ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]=${userId}` ,'redis')
    await this.redis.hset(REDIS_KEYS.REDIS_SESSIONS_KEY, session, userId);
  }

  public async removeSession(session: string) {
    this.logger.debug(`hdel ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]` ,'redis')
    await this.redis.hdel(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
  }

  public async getSession(session: string): Promise<number | null> {
    let a = await this.redis.hget(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
    this.logger.debug(`hget ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]=${a}` ,'redis')
    if (!a) {
      return null;
    }
    return parseInt(a);
  }

  public async addOnline(id: string): Promise<void> {
    this.logger.debug(`sadd ${REDIS_KEYS.REDIS_ONLINE_KEY}=${id}` ,'redis')
    this.redis.sadd(REDIS_KEYS.REDIS_ONLINE_KEY, id)
  }

   public async removeOnline(id: string): Promise<void> {
    this.logger.debug(`srem ${REDIS_KEYS.REDIS_ONLINE_KEY}=${id}` ,'redis')
    this.redis.srem(REDIS_KEYS.REDIS_ONLINE_KEY, id)
  }

  public async getOnline(): Promise<UserOnlineData> {
    let data = await this.redis.smembers(REDIS_KEYS.REDIS_ONLINE_KEY);
    this.logger.debug(`smembers ${REDIS_KEYS.REDIS_ONLINE_KEY}=${data}` ,'redis')
    if (!data) {
      return {};
    }

    return data.reduce((set, currentValue) => {
      let [userId, id] = currentValue.split(':');
      let normalizedUserId = parseInt(userId);
      if (!set[normalizedUserId]) {
        set[normalizedUserId] = []
      }
      set[normalizedUserId].push(id)
      return set;
    }, {} as UserOnlineData);

  }

  public async getNewRedisInstance() {

  }
// import  {promisify} from 'util';
  // public async subscribe(channels: string[]) {
  //   // @ts-expect-error
  //   await promisify(this.redis.subscribe)(...channels);
  // }


}
