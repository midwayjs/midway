import { RuntimeError } from '..';
import * as assert from 'assert';

describe('runtime-error', () => {
  it('create new error', () => {
    try {
      throw new RuntimeError('init fail');
    } catch (e) {
      assert.equal(e.name, `RuntimeError`);
      assert.equal(e.message, `init fail`);
    }
  });

  it('create default error with code', () => {
    const err = RuntimeError.create({
      code: -1,
      message: 'hello world',
      name: 'custom',
    });
    assert(err.name === 'customError');
    assert(err.code === -1);
  });
});
