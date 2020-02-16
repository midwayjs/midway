import * as assert from 'assert';
import { join } from 'path';
import { isPath, safeRequire, generateProvideId, safelyGet } from '../src/common/util';

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
    assert.equal(safeRequire('./fixtures/dir/nok.js'), undefined);
  });

  it('should generateProvideId be ok', () => {
    const id = generateProvideId('@ok:test1', 'ok');
    assert.deepEqual('ok:test1', id, 'provide id is not ok:test1');
    const id2 = generateProvideId('ok:test1', 'ok');
    assert.deepEqual('ok:test1', id2, 'provide id is not ok:test1');
  });

  it('should safeGet be ok', () => {
    const fn = safelyGet(['a', 'b']);
    assert.deepEqual(2, fn({a: {b: 2}}), 'safelyGet one argument not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b'], null), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a1', 'b1'], {a: {b: 2}}), 'safelyGet obj is null not ok');
    assert.deepEqual(undefined, safelyGet(['a', 'b2'], {a: 2}), 'safelyGet obj is number not ok');
  });
});
