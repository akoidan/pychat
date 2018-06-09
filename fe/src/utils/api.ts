import Xhr from './Xhr';
import {Store} from 'vuex';

class Api {
  private xhr: Xhr;
  private store: Store<RootState>;

  constructor(xhr: Xhr, store: Store<RootState>) {
    this.xhr = xhr;
    this.store = store;

  }

  login(form: FormData) {
    this.xhr.doPost('/auth', null, res => {
      let pr = JSON.parse(res);
      if (pr.session) {
        localStorage.setItem('session_id', pr.session);

      } else {
        this.store.dispatch('addGrowl', pr.error);
      }
    }, form);
  }
}