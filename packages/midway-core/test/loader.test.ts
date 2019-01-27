const assert = require('assert');
const request = require('supertest');
const utils = require('./utils');
import * as path from 'path';

describe('/test/loader.test.ts', () => {

  describe('load ts file', () => {
    let app;
    before(() => {
      app = utils.app('base-app', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should get config merge', () => {
      assert(app.config.rundir, path.join(__dirname, './fixtures/enhance/base-app/run'));
    });

    it('should load ts directory', (done) => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('load ts file and use config, plugin decorator', () => {
    let app;
    before(() => {
      app = utils.app('base-app-decorator', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load ts directory', (done) => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect(/3t/, done);
    });

    it('should load ts directory 2', done => {
      request(app.callback())
        .get('/api/baseService')
        .expect(200)
        .expect(/3t/, done);
    });
  });

  describe('load ts file and use third party module', () => {
    let app;
    before(() => {
      app = utils.app('base-app-utils', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should inject ctx be ok', async () => {
      assert.ok(await app.applicationContext.getAsync('baseService'));
    });

    it('should load ts directory and inject module', (done) => {
      request(app.callback())
        .get('/api/test')
        .expect(200)
        .expect('false3', done);
    });
  });

  describe('load ts file and use async init', () => {
    let app;
    before(() => {
      app = utils.app('base-app-async', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load ts directory and inject module', (done) => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('10t', done);
    });
  });

  describe('load ts file support constructor inject', () => {
    let app;
    before(() => {
      app = utils.app('base-app-constructor', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load ts directory and inject in constructor', (done) => {
      request(app.callback())
        .get('/api/test')
        .expect(200)
        .expect('63t', done);
    });
  });

  describe('auto load function file and inject by function name', () => {
    let app;
    before(() => {
      app = utils.app('base-app-function', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load ts directory and inject in constructor', (done) => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('63t', done);
    });

    it('should load ts directory and inject in constructor with error', done => {
      request(app.callback())
        .get('/api/error')
        .expect(200)
        .expect('error', done);
    });
  });

  describe('auto js app loader', () => {
    let app;
    before(() => {
      app = utils.app('js-app-loader', {});
      return app.ready();
    });

    after(() => app.close());

    it('should js app loader should be ok', async () => {
      const a = await app.applicationContext.getAsync('app');
      const c = a.loader.getConfig();

      const cc = {a: 1, b: 2};
      assert.deepEqual(c, cc);
    });
  });

  describe('disable auto app loader', () => {
    let app;
    before(() => {
      app = utils.app('js-app-loader', {container: {disableAutoLoad: true}});
      return app.ready();
    });

    after(() => app.close());

    it('disable js app loader should be ok', async () => {
      let called = false;
      try {
        const a = await app.applicationContext.getAsync('app');
        const c = a.loader.getConfig();

        const cc = {a: 1, b: 2};
        assert.deepEqual(c, cc);
        console.log('------', c, a);
      } catch (e) {
        console.error(e);
        called = true;
      }

      assert.ok(called);
    });
  });

  describe('disable auto app loader', () => {
    let app;
    before(() => {
      app = utils.app('base-app', {container: {disableAutoLoad: true}});
      return app.ready();
    });

    after(() => app.close());

    it('disable js app loader should be ok', async () => {
      try {
        const reqCtx = await app.applicationContext.getAsync('requestContext');
        reqCtx.updateContext({ logger: console });
        reqCtx.get('ctx');
        reqCtx.getAsync('logger');
      } catch (e) {
        console.error(e);
      }
    });
  });
});
