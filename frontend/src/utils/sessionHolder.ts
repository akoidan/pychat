import { SessionHolder } from '@/types/types';

class SessionHolderImpl {

  private static readonly SESSION_KEY = 'session_id';

  set session(value: string|null) {
    if (value) {
      localStorage.setItem(SessionHolderImpl.SESSION_KEY, value);
    } else {
      localStorage.removeItem(SessionHolderImpl.SESSION_KEY);
    }

  }
  get session(): string|null {
   return localStorage.getItem(SessionHolderImpl.SESSION_KEY);
  }

}

export default new SessionHolderImpl() as SessionHolder;
