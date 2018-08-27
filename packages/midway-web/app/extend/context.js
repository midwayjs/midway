'use strict';

const {MidwayRequestContainer} = require('midway-core');
const rc = Symbol('Context#RequestContext');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      this[rc] = new MidwayRequestContainer(this, this.app.applicationContext);
    }
    return this[rc];
  },
};
