import {SessionHolder} from '../types/types';

class SessionHolderImpl {
  set session(value: string) {
      localStorage.setItem('session_id', value);
  }
  get session(): string {
   return localStorage.getItem('session_id');
  }

}

export default new SessionHolderImpl() as SessionHolder;