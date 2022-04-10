import {
  Logger,
  Module
} from '@nestjs/common';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, Logger],
})
export class AuthModule {}
