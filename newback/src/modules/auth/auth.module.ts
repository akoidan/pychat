import {
  Module
} from '@nestjs/common';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import {DatabaseModule} from '@/data/database/database.module';
import {PasswordService} from '@/modules/password/password.service';
import {RedisService} from '@/data/redis/RedisService';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, RedisService],
})
export class AuthModule {}
