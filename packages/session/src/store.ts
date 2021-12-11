import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

export abstract class SessionStore {
  abstract get(key: string);
  abstract set(key: string, value: string, maxAge: number);
  abstract destroy(key);
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class SessionStoreManager {
  private sessionStore: SessionStore;
  setSessionStore(sessionStore) {
    this.sessionStore = sessionStore;
  }
  getSessionStore() {
    return this.sessionStore;
  }
}
