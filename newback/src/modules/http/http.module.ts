import {
  Global,
  Logger,
  Module
} from '@nestjs/common';
import {HttpService} from '@/modules/http/http.service';
import fetch from 'node-fetch';

@Global()
@Module({
  providers: [{
    provide: HttpService,
    useFactory: (logger) => new HttpService(logger, fetch),
    inject: [Logger]
  }],
  exports: [HttpService]
})
export class HttpModule {
}
