'use strict';

const assert = require('assert');

const util = require('../../lib/util.js');

describe('test/lib/util.test.js', () => {

  it('should return full path of module', function() {
    const moduleName = 'egg'
    const path = util.resolveModule(moduleName)
    assert(path && path.length > moduleName.length);
  });

  it('should return void with invalid input', function() {
    const moduleName = 'egg' + Math.random()
    const path =  util.resolveModule(moduleName)
    assert(! path);
  });

});
