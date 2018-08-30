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
};
