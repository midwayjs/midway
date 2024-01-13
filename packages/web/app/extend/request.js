'use strict';

const _querycache = Symbol('_querycache');
const qs = require('qs');

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
      return (
        c[str] ||
        (c[str] = qs.parse(str, this.app.config.egg.queryParseOptions || {}))
      );
    } else {
      return this._customQuery(_querycache, firstValue);
    }
  },
};
