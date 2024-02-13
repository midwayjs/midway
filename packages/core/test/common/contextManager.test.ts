import * as assert from 'assert';
import { NoopContextManager, ASYNC_ROOT_CONTEXT } from '../../src/common/asyncContextManager';

/** Get a key to uniquely identify a context value */
function createContextKey(description: string) {
  // The specification states that for the same input, multiple calls should
  // return different keys. Due to the nature of the JS dependency management
  // system, this creates problems where multiple versions of some package
  // could hold different keys for the same property.
  //
  // Therefore, we use Symbol.for which returns the same key for the same input.
  return Symbol.for(description);
}

describe('NoopContextManager', () => {
  let contextManager: NoopContextManager;

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        contextManager = new NoopContextManager();
        assert.ok(
          contextManager.enable() === contextManager,
          'should return this'
        );
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert.ok(
          contextManager.disable() === contextManager,
          'should return this'
        );
      });
      contextManager.enable();
    });
  });

  describe('.with()', () => {
    it('should run the callback (ROOT_CONTEXT as target)', done => {
      contextManager.with(ASYNC_ROOT_CONTEXT, done);
    });

    it('should run the callback (object as target)', done => {
      const key = createContextKey('test key 1');
      const test = ASYNC_ROOT_CONTEXT.setValue(key, 1);
      contextManager.with(test, () => {
        assert.strictEqual(
          contextManager.active(),
          ASYNC_ROOT_CONTEXT,
          'should not have context'
        );

        assert.strictEqual(test.getValue(key), 1);
        const newCtx =  test.deleteValue(key);
        assert.strictEqual(newCtx.getValue(key), undefined);

        return done();
      });
    });

    it('should run the callback (when disabled)', done => {
      contextManager.disable();
      contextManager.with(ASYNC_ROOT_CONTEXT, () => {
        contextManager.enable();
        return done();
      });
    });

    it('should forward this, arguments and return value', () => {
      function fnWithThis(this: string, a: string, b: number): string {
        assert.strictEqual(this, 'that');
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(a, 'one');
        assert.strictEqual(b, 2);
        return 'done';
      }

      const res = contextManager.with(
        ASYNC_ROOT_CONTEXT,
        fnWithThis,
        'that',
        'one',
        2
      );
      assert.strictEqual(res, 'done');

      assert.strictEqual(
        contextManager.with(ASYNC_ROOT_CONTEXT, () => 3.14),
        3.14
      );
    });
  });

  describe('.active()', () => {
    it('should always return ROOT_CONTEXT (when enabled)', () => {
      assert.strictEqual(
        contextManager.active(),
        ASYNC_ROOT_CONTEXT,
        'should not have context'
      );
    });

    it('should always return ROOT_CONTEXT (when disabled)', () => {
      contextManager.disable();
      assert.strictEqual(
        contextManager.active(),
        ASYNC_ROOT_CONTEXT,
        'should not have context'
      );
      contextManager.enable();
    });
  });

  describe('.bind()', () => {
    it('should return the same target (when enabled)', () => {
      const test = {a: 1};
      assert.deepStrictEqual(
        contextManager.bind(contextManager.active(), test),
        test
      );
    });

    it('should return the same target (when disabled)', () => {
      contextManager.disable();
      const test = {a: 1};
      assert.deepStrictEqual(
        contextManager.bind(contextManager.active(), test),
        test
      );
      contextManager.enable();
    });
  });
});
