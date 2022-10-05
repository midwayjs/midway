import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { SessionStore } from '../interface';

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
