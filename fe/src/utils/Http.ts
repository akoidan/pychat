import loggerFactory from './loggerFactory';
import {PostData, SessionHolder} from '../types/types';
import {Logger} from 'lines-logger';
import {CONNECTION_ERROR} from './consts';
import {getUrl} from './utils';


export default abstract class Http {

  protected httpLogger: Logger;
  protected sessionHolder: SessionHolder;

  constructor( sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLoggerColor('http', '#680061');
  }

  public abstract doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded);

  public abstract doPost<T>(d: PostData<T>): XMLHttpRequest;

  public loadJs(fileUrl: string, callback): void {
    fileUrl = getUrl(fileUrl);
    this.httpLogger.log('GET out {}', fileUrl)();
    let fileRef = document.createElement('script');
    fileRef.setAttribute('type', 'text/javascript');
    fileRef.setAttribute('src', fileUrl);

    document.getElementsByTagName('head')[0].appendChild(fileRef);
    fileRef.onload = callback;
  }

}


