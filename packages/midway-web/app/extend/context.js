'use strict';

const {RequestContainer} = require('injection');
const rc = Symbol('Context#RequestContext');

module.exports = {
  get requestContext() {
    if (!this[rc]) {
      this[rc] = new RequestContainer(this, this.app.applicationContext);
    }
    return this[rc];
  },
};
