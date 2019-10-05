import {PostData, SessionHolder} from '@/types/types';
import {CONNECTION_ERROR, XHR_API_URL} from '@/utils/consts';
import Http from '@/utils/Http';


/**
 * @param params : object dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param formData : form in canse form is used
 * */

export default class Xhr extends Http {

  constructor(sessionHolder: SessionHolder) {
    super(sessionHolder);
  }

  getApiUrl(url) {
    return `${XHR_API_URL}${url}`.replace('{}', window.location.host);
  }

  /**
   * Loads file from server on runtime */
  public doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded: boolean = false) {
    fileUrl = this.getApiUrl(fileUrl);
    this.httpLogger.log('GET out {}', fileUrl)();
    let regexRes = /\.(\w+)(\?.*)?$/.exec(fileUrl);
    let fileType = regexRes != null && regexRes.length === 3 ? regexRes[1] : null;
    let xobj = new XMLHttpRequest();
    // special for IE
    if (xobj.overrideMimeType) {
      xobj.overrideMimeType('application/json');
    }
    xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file

    xobj.onreadystatechange = this.getOnreadystatechange<T>(
        xobj,
        fileUrl,
        isJsonDecoded || fileType === 'json',
        'GET',
        callback
    );
    xobj.send(null);
  }

  doPost<T>(d: PostData<T>): XMLHttpRequest {
    let r: XMLHttpRequest = new XMLHttpRequest();
    r.onreadystatechange = this.getOnreadystatechange(r, d.url, d.isJsonDecoded, 'POST', d.cb);

    let url = this.getApiUrl(d.url);

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
    r.setRequestHeader('session_id', this.sessionHolder.session);

    this.httpLogger.log('POST out {} ::: {} ::: {}', url, d.params, logOut)();
    if (d.process) {
      d.process(r);
    }
    r.send(data);
    return r;
  }

  private getOnreadystatechange<T>(r: XMLHttpRequest, url: string, isJsonDecoded: boolean, type: string, cb: ErrorCB<T>) {
    return () => {
      if (r.readyState === 4) {
        if (r.status === 200) {
          this.httpLogger.log('{} in {} ::: {};', type, url, r.response)();
        } else {
          this.httpLogger.error('{} out: {} ::: {}, status: {}', type, url, r.response, r.status)();
        }
        if (typeof(cb) === 'function') {
          let error;
          let data;
          if (r.status === 0) {
            error = CONNECTION_ERROR;
          } else if (r.status === 200) {
            if (isJsonDecoded) {
              try {
                data = JSON.parse(r.response);
              } catch (e) {
                error = `Unable to parse response ${e}`;
              }
            } else {
              data = r.response;
            }
          } else {
            error = 'Server error';
          }
          cb(data, error);
        } else {
          this.httpLogger.warn('Skipping {} callback for {} {}', cb, type, url)();
        }
      }
    };
  }
}
