import * as assert from 'assert';
import { join } from 'path';
import { isPath, safeRequire } from '../src/common/util';

describe('/test/util.test.ts', () => {
  it('should test is path', () => {
    assert(isPath('@ali/abc') === false);
    assert(isPath('def') === false);
    assert(isPath('bbb-ccc') === false);
    assert(isPath('./hello') === true);
    assert(isPath('../hello') === true);
    assert(isPath('../../bbb') === true);
    assert(isPath('/home/admin/logs') === true);
    assert(isPath('C:\\Program Files') === true);
  });

  it('should test safeRequire', () => {
    assert(safeRequire('@ali/abc') === undefined);
    assert(safeRequire('url') === require('url'));

    assert.equal(safeRequire(join(__dirname, './fixtures/dir/ok')), require('./fixtures/dir/ok'));
    assert.equal(safeRequire(join(__dirname, './fixtures/foo')), undefined);
    assert.equal(safeRequire(join(__dirname, './fixtures/dir/nok.js')), undefined);
  });
});
