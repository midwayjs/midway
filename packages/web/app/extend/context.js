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

  getLogger(name) {
    return this.app.createContextLogger(this, name);
  },

  get logger() {
    if (this[ctxLogger]) {
      return this[ctxLogger];
    }
    return this.app.createContextLogger(this);
  },

  set logger(customLogger) {
    this[ctxLogger] = customLogger;
  },

  setAttr(key, value) {
    this.requestContext.setAttr(key, value);
  },

  getAttr(key) {
    return this.requestContext.getAttr(key);
  },
};
