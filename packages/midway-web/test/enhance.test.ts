const assert = require('assert');
const request = require('supertest');
const path = require('path');
const utils = require('./utils');
const mm = require('mm');

describe('/test/enhance.test.ts', () => {

  describe('load ts file', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load ts directory', (done) => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('load ts class controller use decorator', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-controller', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load controller from requestContext', (done) => {
      request(app.callback())
        .get('/api/index')
        .expect(200)
        .expect('index', done);
    });

    it('should load controller use controller decorator', (done) => {
      request(app.callback())
        .get('/api/test')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('load ts file and use config, plugin decorator', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-decorator', {
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

    it('should hello controller be ok', done => {
      request(app.callback())
        .get('/hello/say')
        .expect(200)
        .expect('service,hello,a,b', done);
    });
  });

  describe('load ts file and use third party module', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-utils', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

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
      app = utils.app('enhance/base-app-async', {
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

  describe('ts directory different from other', function () {

    let app;
    before(() => {
      mm(process.env, 'HOME', '');
      app = utils.app('enhance/base-app', {
        typescript: true
      });
      return app.ready();
    });
    afterEach(mm.restore);
    after(() => app.close());

    it('should appDir not equal baseDir', () => {
      const appInfo = app.loader.getAppInfo();
      assert(appInfo['name'] === app.name);
      assert(appInfo['baseDir'] === app.baseDir);
      assert(appInfo['baseDir'] === app.appDir + '/src');
    });
  });

  describe('load ts file support constructor inject', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-constructor', {
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
  });

  describe('auto load function file and inject by function name', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-function', {
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
  });

  describe('auto load js-app-xml test', () => {
    let app;
    before(() => {
      app = utils.app('enhance/js-app-xml',
        {baseDir: path.join(__dirname, 'fixtures/enhance/js-app-xml')});
      return app.ready();
    });

    after(() => app.close());

    it('js-app-xml get my should be ok', done => {
      request(app.callback())
        .get('/my')
        .expect(200)
        .expect('hello test', done);
    });

    it('js-app-xml get my plugin2 should be ok', done => {
      request(app.callback())
        .get('/my_plugin2')
        .expect(200)
        .expect('plugin2 is not null t', done);
    });

    it('js-app-xml get config should be ok', done => {
      request(app.callback())
        .get('/my_test')
        .expect(200)
        .expect('this is my test', done);
    });

    it('js-app-xml get logger should be ok', done => {
      request(app.callback())
        .get('/my_logger')
        .expect(200)
        .expect('not null', done);
    });

    it('js-app-xml get loggertest should be ok', done => {
      request(app.callback())
        .get('/my_loggertest')
        .expect(200)
        .expect('loggertest is not null', done);
    });

    it('js-app-xml get plugintest should be ok', done => {
      request(app.callback())
        .get('/my_plugintest')
        .expect(200)
        .expect('plugintest is not null t', done);
    });
  });
});
