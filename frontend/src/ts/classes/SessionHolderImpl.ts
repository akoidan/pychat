import { SessionHolder } from '@/ts/types/types';

export class SessionHolderImpl implements SessionHolder {

  private static readonly SESSION_KEY = 'sessionId';

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
