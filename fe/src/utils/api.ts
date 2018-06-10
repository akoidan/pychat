import Xhr from './Xhr';
import {Store} from 'vuex';

export default class Api {
  private xhr: Xhr;
  private store: Store<RootState>;

  constructor(xhr: Xhr, store: Store<RootState>) {
    this.xhr = xhr;
    this.store = store;
  }

  public login(form: FormData, cb: StringCb) {
    this.xhr.doPost('/auth', null, res => {
      try {
        let pr = JSON.parse(res);
        if (pr.session) {
          localStorage.setItem('session_id', pr.session);
          cb(null);
        } else if (pr.error) {
          cb(pr.error);
        } else {
          cb('Unknown error');
        }
      } catch (e) {
        cb('Unable to parse response from server');
      }
    }, form);
  }
}