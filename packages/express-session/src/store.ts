import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SessionStoreManager {
  private sessionStoreClz: (session: any) => new (...args) => any;
  private sessionStore;
  private sessionStoreOptions: any;
  setSessionStore(sessionStore, options) {
    this.sessionStoreClz = sessionStore;
    this.sessionStoreOptions = options;
  }
  getSessionStore(session?) {
    if (!this.sessionStore && this.sessionStoreClz) {
      this.sessionStore = new (this.sessionStoreClz(session))(
        this.sessionStoreOptions
      );
    }
    return this.sessionStore;
  }
}
