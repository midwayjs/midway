'use strict';
const rc = Symbol('Context#RequestContext');
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
};
