import {REDIS_KEYS,} from "@/data/consts";
import {
  Injectable,
  Logger,
} from "@nestjs/common";
import {
  InjectRedis,
  Redis,
} from "@nestjs-modules/ioredis";
import type {UserOnlineData} from "@/data/types/internal";
import type {UserJoinedInfoModel} from "@/data/model/user.joined.info.model";

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly logger: Logger,
  ) {
  }


  public async saveSession(session: string, userId: number): Promise<void> {
    this.logger.debug(`hset ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]=${userId}`, "redis");
    await this.redis.hset(REDIS_KEYS.REDIS_SESSIONS_KEY, session, userId);
  }

  public async getIps(): Promise<UserJoinedInfoModel[]> {
    const newNow = await this.redis.get(REDIS_KEYS.REDIS_IPS_KEY);
    if (newNow) {
      try {
        return JSON.parse(newNow);
      } catch (e) {
      }
    }
    return null;
  }

  public async setIps(value: UserJoinedInfoModel[]): Promise<void> {
    await this.redis.set(REDIS_KEYS.REDIS_IPS_KEY, JSON.stringify(value));
  }

  public async removeSession(session: string) {
    this.logger.debug(`hdel ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]`, "redis");
    await this.redis.hdel(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
  }

  public async getSession(session: string): Promise<number | null> {
    const a = await this.redis.hget(REDIS_KEYS.REDIS_SESSIONS_KEY, session);
    this.logger.debug(`hget ${REDIS_KEYS.REDIS_SESSIONS_KEY}[${session}]=${a}`, "redis");
    if (!a) {
      return null;
    }
    return parseInt(a);
  }

  public async addOnline(id: string): Promise<void> {
    this.logger.debug(`sadd ${REDIS_KEYS.REDIS_ONLINE_KEY}=${id}`, "redis");
    this.redis.sadd(REDIS_KEYS.REDIS_ONLINE_KEY, id);
  }

  public async removeOnline(id: string): Promise<void> {
    this.logger.debug(`srem ${REDIS_KEYS.REDIS_ONLINE_KEY}=${id}`, "redis");
    this.redis.srem(REDIS_KEYS.REDIS_ONLINE_KEY, id);
  }

  public async getOnline(): Promise<UserOnlineData> {
    const data = await this.redis.smembers(REDIS_KEYS.REDIS_ONLINE_KEY);
    this.logger.debug(`smembers ${REDIS_KEYS.REDIS_ONLINE_KEY}=${data}`, "redis");
    if (!data) {
      return {};
    }

    return data.reduce<UserOnlineData>((set, currentValue) => {
      const [userId, id] = currentValue.split(":");
      const normalizedUserId = parseInt(userId);
      if (!set[normalizedUserId]) {
        set[normalizedUserId] = [];
      }
      set[normalizedUserId].push(id);
      return set;
    }, {});
  }

  public async getNewRedisInstance() {

  }

  /*
   * Import  {promisify} from 'util';
   * Public async subscribe(channels: string[]) {
   *   // @ts-expect-error
   *   Await promisify(this.redis.subscribe)(...channels);
   * }
   */
}
