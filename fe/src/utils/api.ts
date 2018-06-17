import Xhr from './Xhr';
import {Store} from 'vuex';
import {RESPONSE_SUCCESS} from './consts';
import {RootState} from '../types';

export default class Api {
  private xhr: Xhr;

  constructor(xhr: Xhr) {
    this.xhr = xhr;
  }

  public login(form: HTMLFormElement, cb: StringCb) {
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
        if (res) {
          cb(res);
        }  else {
          cb('Unable to parse response from server');
        }
      }
    }, new FormData(form));
  }

  public sendRestorePassword(form: HTMLFormElement, cb: StringCb) {
    this.xhr.doPost('/send_restore_password', null, (data, error) => {
      if (error) {
        cb(error);
      } else if (data === RESPONSE_SUCCESS) {
        cb(null);
      } else {
        cb(data);
      }
    }, new FormData(form));
  }

  public register(form: HTMLFormElement, cb: StringCb) {
    this.xhr.doPost('/register', null, (res, error) => {
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
        if (res) {
          cb(res);
        }  else {
          cb('Unable to parse response from server');
        }
      }
    }, new FormData(form));
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


  public uploadFile(fd: FormData, cb: Function, progress: Function) {
    this.xhr.doPost('/upload_file', null,  (data, error) => {
      if (error) {
        cb(null, error);
      } else {
        let parse;
        try {
          parse = JSON.parse(data);
        } catch (e) {
          cb(null, 'Unable to parse response');
          return;
        }
        cb(parse);
      }
    }, fd, null, r => {
      r.upload.addEventListener('progress', progress);
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
    }, );
  }
}