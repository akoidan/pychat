import {
  Global,
  Module,
} from "@nestjs/common";
import {ConfigService} from "@/modules/shared/config/config.service";
import {config} from "node-ts-config";

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useFactory: () => new ConfigService(config),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {
}
