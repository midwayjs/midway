'use strict';

const rc = Symbol('Context#RequestContext');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      const requestContext = this.app.applicationContext.get('requestContext');
      requestContext.updateContext(this);
      this[rc] = requestContext;
    }
    return this[rc];
  },

  /**
   * 代理egg的this.ctx.proxy
   * 从当前requestContext获取，requestContext不存在则从applicationContext获取
   */
  get proxy() {
    return new Proxy({}, {
      get: (target, name) => {
        return this[rc] ? this[rc].get(name) : this.app.applicationContext.get(name);
      }
    })
  }
};
