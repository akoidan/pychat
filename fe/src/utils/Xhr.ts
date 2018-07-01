import loggerFactory from './loggerFactory';
import {PostData, SessionHolder} from '../types/types';
import {Logger} from 'lines-logger';


/**
 * @param params : object dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param formData : form in canse form is used
 * */

export default class Xhr {

  private httpLogger: Logger;
  private apiUrl: string;
  private sessionHolder: SessionHolder;

  constructor(apiUrl: string, sessionHolder: SessionHolder) {
    this.sessionHolder = sessionHolder;
    this.httpLogger = loggerFactory.getLoggerColor('http', '#680061');
    this.apiUrl = apiUrl;
  }


  static readCookie(): Map<String, any> {
    let c, C, i;
    c = document.cookie.split('; ');
    let cookies = new Map<String, any>();
    for (i = c.length - 1; i >= 0; i--) {
      C = c[i].split('=');
      if (C[1]) {
        let length = C[1].length - 1;
        // if cookie is wrapped with quotes (for ex api)
        if (C[1][0] === '"' && C[1][length] === '"') {
          C[1] = C[1].substring(1, length);
        }
      }
      cookies[C[0]] = C[1];
    }
    return cookies;
  }

  private getUrl(url: string): string {
    if (!url) {
      url = this.apiUrl;
    } else if (/^https?:\/\//.exec(url)) {
      return url;
    } else {
      return this.apiUrl + url;
    }
  }


  /**
   * Loads file from server on runtime */
  public doGet(fileUrl: string, callback: Function) {
    fileUrl = this.getUrl(fileUrl);
    this.httpLogger.log('GET out {}', fileUrl)();
    let regexRes = /\.(\w+)(\?.*)?$/.exec(fileUrl);
    let fileType = regexRes != null && regexRes.length === 3 ? regexRes[1] : null;
    let fileRef = null;
    switch (fileType) {
      case 'js':
        fileRef = document.createElement('script');
        fileRef.setAttribute('type', 'text/javascript');
        fileRef.setAttribute('src', fileUrl);
        break;
      case 'css':
        fileRef = document.createElement('link');
        fileRef.setAttribute('rel', 'stylesheet');
        fileRef.setAttribute('type', 'text/css');
        fileRef.setAttribute('href', fileUrl);
        break;
      case 'json':
      default:
        let xobj = new XMLHttpRequest();
        // special for IE
        if (xobj.overrideMimeType) {
          xobj.overrideMimeType('application/json');
        }
        xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = () => {
          if (xobj.readyState === 4) {
            if (xobj.status === 200) {
              this.httpLogger.log('GET in {} ::: "{}"...', fileUrl, xobj.responseText.substr(0, 100))();
              if (callback) {
                if (fileType === 'json') {
                  callback(JSON.parse(xobj.responseText));
                } else {
                  callback(xobj.responseText);
                }
              }
            } else {
              this.httpLogger.error('Unable to load {}, XMLHttpRequest: {}', fileUrl, xobj)();
              // growlError('<span>Unable to load {}, response code is <b>{}</b>, response: {} <span>'.format(fileUrl, xobj.status, xobj.response));
            }
          }
        };
        xobj.send(null);
    }
    if (fileRef) {
      document.getElementsByTagName('head')[0].appendChild(fileRef);
      fileRef.onload = callback;
    }
  }

  doPost<T>(d: PostData<T>): XMLHttpRequest {
    let r: XMLHttpRequest = new XMLHttpRequest();
    r.onreadystatechange = () => {
      if (r.readyState === 4) {
        if (r.status === 200) {
          this.httpLogger.log('POST in {} ::: {};', d.url, r.response)();
        } else {
          this.httpLogger.error('POST out: {} ::: {}, status: {}', d.url, r.response, r.status)();
        }
        if (typeof(d.cb) === 'function') {
          let error;
          let data;
          if (r.status === 0) {
            error = `Connection error`;
          } else if (r.status === 200) {
            if (d.isJsonDecoded) {
              try {
                data = JSON.parse(r.response);
              } catch (e) {
                error =  `Unable to parse response ${e}`;
              }
            } else {
              data = r.response;
            }
          } else {
            error = 'Server error';
          }
          d.cb(data, error);
        } else {
          this.httpLogger.warn('Skipping {} callback for POST {}', d.cb, d.url)();
        }
      }
    };

    let url = this.getUrl(d.url);

    r.open('POST', url, true);
    let data;
    let logOut: String = '';
    if (d.isJsonEncoded) {
      data = JSON.stringify(d.params);
      r.setRequestHeader('Content-Type', 'application/json');
    } else {
      /*Firefox doesn't accept null*/
      data = d.formData ? d.formData : new FormData();

      if (d.params) {
        for (let key in d.params) {
          data.append(key, d.params[key]);
        }
      }
      if (data.entries) {
        let entries = data.entries();
        if (entries && entries.next) {
          let d;
          while (d = entries.next()) {
            if (d.done) {
              break;
            }
            logOut += `${d.value[0]}= ${d.value[1]};`;
          }
        }
      }
    }
    r.setRequestHeader('session-id', this.sessionHolder.session);

    this.httpLogger.log('POST out {} ::: {} ::: {}', url, d.params, logOut)();
    if (d.process) {
      d.process(r);
    }
    r.send(data);
    return r;
  }
}
