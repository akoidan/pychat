import loggerFactory from '@/utils/loggerFactory';
import {PostData, SessionHolder} from '@/types/types';
import {Logger} from 'lines-logger';


export default abstract class Http {

  protected httpLogger: Logger;
  protected sessionHolder: SessionHolder;

  constructor( sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLoggerColor('http', '#680061');
  }

  public abstract doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded);

  public abstract doPost<T>(d: PostData<T>): XMLHttpRequest;

  public loadJs(fullFileUrlWithProtocol: string, callback): void {
    this.httpLogger.log('GET out {}', fullFileUrlWithProtocol)();
    let fileRef = document.createElement('script');
    fileRef.setAttribute('type', 'text/javascript');
    fileRef.setAttribute('src', fullFileUrlWithProtocol);

    document.getElementsByTagName('head')[0].appendChild(fileRef);
    fileRef.onload = callback;
  }

}


