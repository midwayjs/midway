import { pathMatching as match } from '../../src/';
import * as assert from 'assert';

describe('/test/util/path-matching.test.ts', () => {
  it('options.match and options.ignore both present should throw', () => {
    try {
      match({ ignore: '/api', match: '/dashboard' });
      throw new Error('should not exec');
    } catch (e) {
      assert.ok(e.message === 'options.match and options.ignore can not both present');
    }
  });

  it('options.match and options.ignore both not present should always return true', () => {
    const fn = match({});
    assert.ok(fn() === true);
  });

  describe('match', () => {
    it('support string', () => {
      const fn = match({ match: '/api' });
      assert.ok(fn({ path: '/api/hello' }) === false);
      assert.ok(fn({ path: '/api/' }) === true);
      assert.ok(fn({ path: '/api' }) === true);
      assert.ok(fn({ path: '/api1/hello' }) === false);
      assert.ok(fn({ path: '/api1' }) === false);
    });

    it('support regexp', () => {
      const fn = match({ match: /^\/api/ });
      assert.ok(fn({ path: '/api/hello' }) === true);
      assert.ok(fn({ path: '/api/' }) === true);
      assert.ok(fn({ path: '/api' }) === true);
      assert.ok(fn({ path: '/api1/hello' }) === true);
      assert.ok(fn({ path: '/api1' }) === true);
      assert.ok(fn({ path: '/v1/api1' }) === false);
    });

    it('support global regexp', () => {
      const fn = match({ match: /^\/api/g });
      assert.ok(fn({ path: '/api/hello' }) === true);
      assert.ok(fn({ path: '/api/' }) === true);
      assert.ok(fn({ path: '/api' }) === true);
      assert.ok(fn({ path: '/api1/hello' }) === true);
      assert.ok(fn({ path: '/api1' }) === true);
      assert.ok(fn({ path: '/v1/api1' }) === false);
    });

    it('support function', () => {
      const fn = match({
        match: ctx => ctx.path.startsWith('/api'),
      });
      assert.ok(fn({ path: '/api/hello' }) === true);
      assert.ok(fn({ path: '/api/' }) === true);
      assert.ok(fn({ path: '/api' }) === true);
      assert.ok(fn({ path: '/api1/hello' }) === true);
      assert.ok(fn({ path: '/api1' }) === true);
      assert.ok(fn({ path: '/v1/api1' }) === false);
    });

    it('support array', () => {
      const fn = match({
        match: [ ctx => ctx.path.startsWith('/api'), '/ajax', /^\/foo$/ ],
      });
      assert.ok(fn({ path: '/api/hello' }) === true);
      assert.ok(fn({ path: '/api/' }) === true);
      assert.ok(fn({ path: '/api' }) === true);
      assert.ok(fn({ path: '/api1/hello' }) === true);
      assert.ok(fn({ path: '/api1' }) === true);
      assert.ok(fn({ path: '/v1/api1' }) === false);
      assert.ok(fn({ path: '/ajax/hello' }) === false);
      assert.ok(fn({ path: '/foo' }) === true);
    });
  });

  describe('ignore', () => {
    it('support string', () => {
      const fn = match({ ignore: '/api' });
      assert.ok(fn({ path: '/api/hello' }) === true);
      assert.ok(fn({ path: '/api/' }) === false);
      assert.ok(fn({ path: '/api' }) === false);
      assert.ok(fn({ path: '/api1/hello' }) === true);
      assert.ok(fn({ path: '/api1' }) === true);
    });

    it('support regexp', () => {
      const fn = match({ ignore: /^\/api/ });
      assert.ok(fn({ path: '/api/hello' }) === false);
      assert.ok(fn({ path: '/api/' }) === false);
      assert.ok(fn({ path: '/api' }) === false);
      assert.ok(fn({ path: '/api1/hello' }) === false);
      assert.ok(fn({ path: '/api1' }) === false);
      assert.ok(fn({ path: '/v1/api1' }) === true);
    });

    it('support global regexp', () => {
      const fn = match({ ignore: /^\/api/g });
      assert.ok(fn({ path: '/api/hello' }) === false);
      assert.ok(fn({ path: '/api/' }) === false);
      assert.ok(fn({ path: '/api' }) === false);
      assert.ok(fn({ path: '/api1/hello' }) === false);
      assert.ok(fn({ path: '/api1' }) === false);
      assert.ok(fn({ path: '/v1/api1' }) === true);
    });

    it('support function', () => {
      const fn = match({
        ignore: ctx => ctx.path.startsWith('/api'),
      });
      assert.ok(fn({ path: '/api/hello' }) === false);
      assert.ok(fn({ path: '/api/' }) === false);
      assert.ok(fn({ path: '/api' }) === false);
      assert.ok(fn({ path: '/api1/hello' }) === false);
      assert.ok(fn({ path: '/api1' }) === false);
      assert.ok(fn({ path: '/v1/api1' }) === true);
    });

    it('support array', () => {
      const fn = match({
        ignore: [ ctx => ctx.path.startsWith('/api'), '/ajax', /^\/foo$/ ],
      });
      assert.ok(fn({ path: '/api/hello' }) === false);
      assert.ok(fn({ path: '/api/' }) === false);
      assert.ok(fn({ path: '/api' }) === false);
      assert.ok(fn({ path: '/api1/hello' }) === false);
      assert.ok(fn({ path: '/api1' }) === false);
      assert.ok(fn({ path: '/v1/api1' }) === true);
      assert.ok(fn({ path: '/ajax/hello' }) === true);
      assert.ok(fn({ path: '/foo' }) === false);
    });
  });
});
