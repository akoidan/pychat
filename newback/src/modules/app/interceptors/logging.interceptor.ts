import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import {
  Observable,
  tap,
  throwError
} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  private id: number = 0;

  constructor(private readonly logger: Logger) {

  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let request = context.switchToHttp().getRequest();
    let thisId = this.id++;
    if (request.body) {
      this.logger.debug(`Request[${thisId}]: body=${JSON.stringify(request.body)}, headers=${JSON.stringify(request.headers)}`, 'http');
    }
    return next.handle().pipe(tap((responseBody) => {
      this.logger.debug(`Response[${thisId}]: body=${JSON.stringify(responseBody)}`, 'Http')
    })).pipe(catchError(err => {
      this.logger.error(`Response[${thisId}]]: err='${err.message}', body=${JSON.stringify(err.response)}`, err.stack, 'http');
      return throwError(err)
    }));
  }

}
