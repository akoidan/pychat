import {
  Module
} from '@nestjs/common';
import {AuthModule} from '@/modules/auth/auth.module';
import {DatabaseModule} from '@/data/database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  exports: [DatabaseModule]
})
export class AppModule {}
