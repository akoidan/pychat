import Xhr from './Xhr';
import {Store} from 'vuex';
import {RESPONSE_SUCCESS} from './consts';

export default class Api {
  private xhr: Xhr;
  private store: Store<RootState>;

  constructor(xhr: Xhr, store: Store<RootState>) {
    this.xhr = xhr;
    this.store = store;
  }

  public login(form: FormData, cb: StringCb) {
    this.xhr.doPost('/auth', null, (res, error) => {
      if (error) {
        cb(error);
        return;
      }
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

  public validateUsername(username: string, cb: StringCb) {
    this.xhr.doPost('/validate_user', {username},  (data, error) => {
      if (error) {
        cb(error);
      } else if (data === RESPONSE_SUCCESS) {
        cb(null);
      } else {
        cb(data);
      }
    });
  }

  public validateEmail(email: string, cb: StringCb) {
    this.xhr.doPost('/validate_email', {email},  (data, error) => {
      if (error) {
        cb(error);
      } else if (data === RESPONSE_SUCCESS) {
        cb(null);
      } else {
        cb(data);
      }
    });
  }
}