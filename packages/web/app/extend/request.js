'use strict';

const _querycache = Symbol('_querycache');
const qs = require('querystring');

function firstValue(value) {
  if (Array.isArray(value)) {
    value = value[0];
  }
  return value;
}

module.exports = {
  get query() {
    if (this.app.config.egg.queryParseMode === 'simple') {
      const str = this.querystring;
      const c = (this._querycache = this._querycache || {});
      return c[str] || (c[str] = qs.parse(str));
    } else {
      return this._customQuery(_querycache, firstValue);
    }
  },
};
