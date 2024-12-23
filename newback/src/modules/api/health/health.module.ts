import {Module} from "@nestjs/common";
import {DatabaseModule} from "@/modules/shared/database/database.module";
import {HealthController} from "@/modules/api/health/health.controller";
import {HealthService} from "@/modules/api/health/health.service";

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {
}
