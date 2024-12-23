import type {SessionHolder} from "@/ts/types/types";

export class SessionHolderImpl implements SessionHolder {
  private static readonly SESSION_KEY = "sessionId";
  private static readonly WS_CONNECTION_ID_KEY = "wsConnectionId";

  get session(): string | null {
    return localStorage.getItem(SessionHolderImpl.SESSION_KEY);
  }

  set session(value: string | null) {
    if (value) {
      localStorage.setItem(SessionHolderImpl.SESSION_KEY, value);
    } else {
      localStorage.removeItem(SessionHolderImpl.SESSION_KEY);
    }
  }

   get wsConnectionId(): string | null {
    return sessionStorage.getItem(SessionHolderImpl.WS_CONNECTION_ID_KEY);
  }

  set wsConnectionId(value: string | null) {
    if (value) {
      sessionStorage.setItem(SessionHolderImpl.WS_CONNECTION_ID_KEY, value);
    } else {
      sessionStorage.removeItem(SessionHolderImpl.WS_CONNECTION_ID_KEY);
    }
  }
}
