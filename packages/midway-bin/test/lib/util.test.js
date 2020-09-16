'use strict';
const pathx = require('path');

const assert = require('assert');

const util = require('../../lib/util.js');

describe('test/lib/util.test.js', () => {
  it('should return full path of module', () => {
    const moduleName = 'egg-bin';
    const path = util.resolveModule(moduleName);
    console.log('resolved path is:', path);
    assert(path && path.endsWith(`${pathx.sep}${moduleName}`));
  });

  it('should return blank with invalid input', () => {
    const moduleName = 'egg' + Math.random();
    const path = util.resolveModule(moduleName);
    assert(path === '');
  });

  it('should return blank with empty input', () => {
    const moduleName = '';
    const path = util.resolveModule(moduleName);
    assert(path === '');
  });
});
