import loggerFactory from '@/utils/loggerFactory';
import {PostData, SessionHolder} from '@/types/types';
import {Logger} from 'lines-logger';
import {CONNECTION_ERROR} from '@/utils/consts';
import Http from '@/utils/Http';


/**
 * @param params : object dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param formData : form in canse form is used
 * */

export default class Fetch /*extends Http*/ {


  constructor(apiUrl: string, sessionHolder: SessionHolder) {
    // super(apiUrl, sessionHolder);
  }

  //
  // /**
  //  * Loads file from server on runtime */
  // public doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded: boolean = false) {
  //   fileUrl = this.getUrl(fileUrl);
  //   this.httpLogger.log('GET out {}', fileUrl)();
  //   let regexRes = /\.(\w+)(\?.*)?$/.exec(fileUrl);
  //   let fileType = regexRes != null && regexRes.length === 3 ? regexRes[1] : null;
  //   let xobj = new XMLHttpRequest();
  //   // special for IE
  //   if (xobj.overrideMimeType) {
  //     xobj.overrideMimeType('application/json');
  //   }
  //   xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
  //
  //   xobj.onreadystatechange = this.getOnreadystatechange<T>(
  //       xobj,
  //       fileUrl,
  //       isJsonDecoded || fileType === 'json',
  //       'GET',
  //       callback
  //   );
  //   xobj.send(null);
  // }
  //
  // async asyncPost<T>(d: PostData<T>) {
  //   let config: RequestInit = {
  //     cache: 'no-cache',
  //     headers: {
  //       'session-id': this.sessionHolder.session
  //     },
  //   };
  //   if (d.isJsonEncoded) {
  //     config.headers['Content-Type'] = 'application/json';
  //   } else {
  //     let body;
  //     let logOut: string = '';
  //     body = d.formData ? d.formData : new FormData();
  //     if (d.params) {
  //       for (let key in d.params) {
  //         body.append(key, d.params[key]);
  //       }
  //     }
  //     if (body.entries) {
  //       let entries = body.entries();
  //       if (entries && entries.next) {
  //         let d;
  //         while (d = entries.next()) {
  //           if (d.done) {
  //             break;
  //           }
  //           logOut += `${d.value[0]}= ${d.value[1]};`;
  //         }
  //       }
  //     }
  //   }
  //   await fetch(d.url, config);
  // }
  //
  // doPost<T>(d: PostData<T>): XMLHttpRequest {
  //   let r: XMLHttpRequest = new XMLHttpRequest();
  //   r.onreadystatechange = this.getOnreadystatechange(r, d.url, d.isJsonDecoded, 'POST', d.cb);
  //
  //   let url = this.getUrl(d.url);
  //
  //   r.open('POST', url, true);
  //   let data;
  //   let logOut: String = '';
  //   if (d.isJsonEncoded) {
  //     data = JSON.stringify(d.params);
  //     r.setRequestHeader('Content-Type', 'application/json');
  //   } else {
  //     /*Firefox doesn't accept null*/
  //
  //   }
  //
  //   this.httpLogger.log('POST out {} ::: {} ::: {}', url, d.params, logOut)();
  //   if (d.process) {
  //     d.process(r);
  //   }
  //   r.send(data);
  //   return r;
  // }
}
