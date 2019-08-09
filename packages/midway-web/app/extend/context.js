'use strict';

const rc = Symbol('Context#RequestContext');
const { MidwayRequestContainer } = require('midway-core');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      this[rc] = new MidwayRequestContainer(this.app.applicationContext, this);
      this[rc].ready();
    }
    return this[rc];
  },
};
