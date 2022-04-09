import {
  Module
} from '@nestjs/common';
import {AuthModule} from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
