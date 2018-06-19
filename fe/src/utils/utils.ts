import store from '../store';
import router from '../router';
import sessionHolder from './sessionHolder';

export function logout(errMessage: string) {
  store.dispatch('logout');
  if (errMessage) {
    store.dispatch('growlError', errMessage);
  }
  sessionHolder.session = '';
  router.replace('/auth/login');
}