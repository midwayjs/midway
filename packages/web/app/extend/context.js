'use strict';
const rc = Symbol('Context#RequestContext');
const ctxLogger = Symbol('Context#ContextLogger');
const { MidwayRequestContainer } = require('@midwayjs/core');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      this[rc] = new MidwayRequestContainer(this, this.app.applicationContext);
      this[rc].ready();
    }
    return this[rc];
  },
  get startTime() {
    return this['starttime'];
  },

  get logger() {
    if (this[ctxLogger]) {
      return this[ctxLogger];
    }
    return this.getLogger('logger');
  },

  set logger(customLogger) {
    this[ctxLogger] = customLogger;
  },
};
