import { join } from 'path';
import { isMatch } from 'micromatch';
import * as minimatch from 'minimatch';
import * as picomatch from 'picomatch';
import * as assert from 'assert';
import { createExpressSuit, createKoaSuit } from '@midwayjs/gateway-core';

describe('/test/index.test.ts', () => {
  describe('test url match', () => {
    it('test micromatch', () => {
      assert.equal(isMatch('/server/user/info', '/server/user/info'), true);
      assert.equal(isMatch('/server/user/info', '/server/user/info/1'), false);
      assert.equal(isMatch('/server/user/info', '/server/user/info/**'), true);
      assert.equal(isMatch('/server/user/info', '/server/user/**'), true);
      assert.equal(isMatch('/bbbbbb/ccccc', '/**'), true);
      assert.equal(isMatch('/api/abc', '/api/**'), true);
      assert.equal(isMatch('/api/a/b/c/d', '/api/a/b/c'), false);
    });

    it('test minimatch', () => {
      assert.equal(minimatch('/server/user/info', '/server/user/info'), true);
      assert.equal(
        minimatch('/server/user/info', '/server/user/info/1'),
        false
      );
      // assert.equal(minimatch('/server/user/info', '/server/user/info/**'), true);
      assert.equal(minimatch('/server/user/info', '/server/user/**'), true);
      assert.equal(minimatch('/bbbbbb/ccccc', '/**'), true);
      assert.equal(minimatch('/api/abc', '/api/**'), true);
      assert.equal(minimatch('/api/a/b/c/d', '/api/a/b/c'), false);
    });

    it('test picomatch', () => {
      assert.equal(
        picomatch.isMatch('/server/user/info', '/server/user/info'),
        true
      );
      assert.equal(
        picomatch.isMatch('/server/user/info', '/server/user/info/1'),
        false
      );
      assert.equal(
        picomatch.isMatch('/server/user/info', '/server/user/info/**'),
        true
      );
      assert.equal(
        picomatch.isMatch('/server/user/info', '/server/user/**'),
        true
      );
      assert.equal(picomatch.isMatch('/bbbbbb/ccccc', '/**'), true);
      assert.equal(picomatch.isMatch('/api/abc', '/api/**'), true);
      assert.equal(picomatch.isMatch('/api/a/b/c/d', '/api/a/b/c'), false);
    });
  });

  describe('test express', () => {
    it('test /server/user/info', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
        .post('/server/user/info')
        .query({
          action: 'doTest',
        })
        .send({ name: 'zhangting' })
        .expect('Content-type', 'text/html; charset=utf-8')
        .expect(/zhangting,hello http world,doTest/)
        .expect('x-schema', 'bbb')
        .expect(200, done);
    });

    it('test /* router', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
        .post('/bbbbbb/ccccc')
        .query({
          action: 'doTest',
        })
        .expect(/test2/)
        .expect(200, done);
    });

    it('test /api/* router', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
        .post('/api/abc')
        .query({
          action: 'doTest',
        })
        .expect(/test3/)
        .expect(200, done);
    });

    it('test /api/a/b/c router', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
        .post('/api/a/b/c')
        .query({
          action: 'doTest',
        })
        .expect(/test4/)
        .expect(200, done);
    });

    it('test /api/a/b/c/d router must match /api/* not /api/a/b/c', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
      })
        .post('/api/a/b/c/d')
        .expect(/test3/)
        .expect(200, done);
    });
  });

  it('should invoke by http api and koa', done => {
    createKoaSuit({
      functionDir: join(__dirname, './fixtures/ice-demo-repo'),
      sourceDir: 'src/apis',
    })
      .post('/server/user/info')
      .query({
        action: 'doTest',
      })
      .send({ name: 'zhangting' })
      .expect('Content-type', 'text/html; charset=utf-8')
      .expect(/zhangting,hello http world,doTest/)
      .expect('x-schema', 'bbb')
      .expect(200, done);
  });

  describe('test koa ignore pattern', () => {
    it('should test ignore pattern', done => {
      createKoaSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignorePattern: ['.do'],
      })
        .post('/ignore.do')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });

    it('should test ignore pattern by function', done => {
      createKoaSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignorePattern: req => {
          return /\.do/.test(req.url);
        },
      })
        .post('/ignore.do')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });

    it('should support ignore wildcard function', done => {
      createKoaSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignoreWildcardFunctions: ['test2'],
      })
        .post('/p')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });
  });

  describe('test express ignore pattern', () => {
    it('should test ignore pattern', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignorePattern: ['.do'],
      })
        .post('/ignore.do')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });

    it('should test ignore pattern by function', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignorePattern: req => {
          return /\.do/.test(req.url);
        },
      })
        .post('/ignore.do')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });

    it('should support ignore wildcard function', done => {
      createExpressSuit({
        functionDir: join(__dirname, './fixtures/ice-demo-repo'),
        sourceDir: 'src/apis',
        ignoreWildcardFunctions: ['test2'],
      })
        .post('/p')
        .send({ name: 'zhangting' })
        .expect(404, done);
    });
  });
});
