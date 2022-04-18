import {
  Global,
  Logger,
  Module,
} from "@nestjs/common";

@Global()
@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {
}
