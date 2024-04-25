import { Provide, Scope, ScopeEnum, Types } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class SessionStoreManager {
  private sessionStoreClz:
    | (new (...args) => any)
    | ((session: any) => new (...args) => any);
  private sessionStore;
  private sessionStoreOptions: any;
  setSessionStore(sessionStore, options = {}) {
    this.sessionStoreClz = sessionStore;
    this.sessionStoreOptions = options;
  }
  getSessionStore(session?) {
    if (!this.sessionStore && this.sessionStoreClz) {
      if (Types.isClass(this.sessionStoreClz)) {
        this.sessionStore = new (this.sessionStoreClz as new (...args) => any)(
          this.sessionStoreOptions
        );
      } else if (typeof this.sessionStoreClz === 'function') {
        // 因为 session 扩展的规范是传入 express-session 对象，所以这里需要传入 session
        this.sessionStore = new ((
          this.sessionStoreClz as (session: any) => new (...args) => any
        )(session))(this.sessionStoreOptions);
      } else {
        this.sessionStore = this.sessionStoreClz;
      }
    }
    return this.sessionStore;
  }
}
