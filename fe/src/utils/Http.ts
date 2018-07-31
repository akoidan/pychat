import loggerFactory from './loggerFactory';
import {PostData, SessionHolder} from '../types/types';
import {Logger} from 'lines-logger';
import {CONNECTION_ERROR} from './consts';


export default abstract class Http {

  protected httpLogger: Logger;
  protected apiUrl: string;
  protected sessionHolder: SessionHolder;

  constructor(apiUrl: string, sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLoggerColor('http', '#680061');
    this.apiUrl = apiUrl;
  }

  protected getUrl(url: string): string {
    if (!url) {
      return this.apiUrl;
    } else if (/^https?:\/\//.exec(url) || (url && url.indexOf('//') === 0) /*cdn*/) {
      return url;
    } else {
      return this.apiUrl + url;
    }
  }

  public abstract doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded);

  public abstract doPost<T>(d: PostData<T>): XMLHttpRequest;

  public loadJs(fileUrl: string, callback): void {
    fileUrl = this.getUrl(fileUrl);
    this.httpLogger.log('GET out {}', fileUrl)();
    let fileRef = document.createElement('script');
    fileRef.setAttribute('type', 'text/javascript');
    fileRef.setAttribute('src', fileUrl);

    document.getElementsByTagName('head')[0].appendChild(fileRef);
    fileRef.onload = callback;
  }

}


