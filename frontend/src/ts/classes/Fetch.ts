import type {SessionHolder} from "@/ts/types/types";

/**
 * @param params : object dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param formData : form in canse form is used
 *
 */

export default class Fetch /* Extends Http*/ {
  public constructor(apiUrl: string, sessionHolder: SessionHolder) {
    // Super(apiUrl, sessionHolder);
  }

  //
  // /**
  //  * Loads file from server on runtime */
  // Public doGet<T>(fileUrl: string, callback: ErrorCB<T>, isJsonDecoded: boolean = false) {
  //   FileUrl = this.getUrl(fileUrl);
  //   This.httpLogger.log('GET out {}', fileUrl)();
  //   Let regexRes = /\.(\w+)(\?.*)?$/.exec(fileUrl);
  //   Let fileType = regexRes != null && regexRes.length === 3 ? regexRes[1] : null;
  //   Let xobj = new XMLHttpRequest();
  //   // special for IE
  //   If (xobj.overrideMimeType) {
  //     Xobj.overrideMimeType('application/json');
  //   }
  //   Xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
  //
  //   Xobj.onreadystatechange = this.getOnreadystatechange<T>(
  //       Xobj,
  //       FileUrl,
  //       IsJsonDecoded || fileType === 'json',
  //       'GET',
  //       Callback
  //   );
  //   Xobj.send(null);
  // }
  //
  // Async asyncPost<T>(d: PostData<T>) {
  //   Let config: RequestInit = {
  //     Cache: 'no-cache',
  //     Headers: {
  //       'session-id': this.sessionHolder.session
  //     },
  //   };
  //   If (d.isJsonEncoded) {
  //     Config.headers['Content-Type'] = 'application/json';
  //   } else {
  //     Let body;
  //     Let logOut: string = '';
  //     Body = d.formData ? d.formData : new FormData();
  //     If (d.params) {
  //       For (let key in d.params) {
  //         Body.append(key, d.params[key]);
  //       }
  //     }
  //     If (body.entries) {
  //       Let entries = body.entries();
  //       If (entries && entries.next) {
  //         Let d;
  //         While (d = entries.next()) {
  //           If (d.done) {
  //             Break;
  //           }
  //           LogOut += `${d.value[0]}= ${d.value[1]};`;
  //         }
  //       }
  //     }
  //   }
  //   Await fetch(d.url, config);
  // }
  //
  // DoPost<T>(d: PostData<T>): XMLHttpRequest {
  //   Let r: XMLHttpRequest = new XMLHttpRequest();
  //   R.onreadystatechange = this.getOnreadystatechange(r, d.url, d.isJsonDecoded, 'POST', d.cb);
  //
  //   Let url = this.getUrl(d.url);
  //
  //   R.open('POST', url, true);
  //   Let data;
  //   Let logOut: String = '';
  //   If (d.isJsonEncoded) {
  //     Data = JSON.stringify(d.params);
  //     R.setRequestHeader('Content-Type', 'application/json');
  //   } else {
  //     /*Firefox doesn't accept null*/
  //
  //   }
  //
  //   This.httpLogger.log('POST out {} ::: {} ::: {}', url, d.params, logOut)();
  //   If (d.process) {
  //     D.process(r);
  //   }
  //   R.send(data);
  //   Return r;
  // }
}
