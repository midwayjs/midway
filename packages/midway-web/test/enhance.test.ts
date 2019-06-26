const assert = require('assert');
const request = require('supertest');
import * as path from 'path';
const utils = require('./utils');
const mm = require('mm');
const pedding = require('pedding');
const rimraf = require('mz-modules/rimraf');

import { clearAllModule } from 'injection';

describe('/test/enhance.test.ts', () => {

  afterEach(clearAllModule);

  describe('load ts file', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app', {
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
        .get('/components/')
        .expect(200)
        .expect('hello', done);
    });

    it('should load controller use controller decorator prefix /', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });
  });

  describe('load ts class when controller has default export', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-controller-default-export', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load controller', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });

  });

  describe('load ts class controller use decorator conflicts', () => {
    let app;
    it('should load controller conflicts', async () => {
      let suc = false;
      try {
        app = utils.app('enhance/base-app-controller-conflicts', {
          typescript: true
        });
        await app.ready();
      } catch (e) {
        suc = true;
      }
      assert.ok(suc);
    });
  });

  describe('load ts class and use default scope', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-default-scope', {
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

    after(() => {
      rimraf(path.join(app.config.baseDir, 'app/public'));
      app.close();
    });

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

    it('should param controller be ok ', async () => {
      // done = pedding(11, done);

      app.mockCsrf();

      await request(app.callback())
        .get('/param/12/test?name=1')
        .expect(200)
        .expect({id: '12', name: '1'});

      await request(app.callback())
        .get('/param/query?name=1')
        .expect(200)
        .expect({name: '1'});

      await request(app.callback())
        .get('/param/query_id?id=1')
        .expect(200)
        .expect('1');

      await request(app.callback())
        .get('/param/param/12/test/456')
        .expect(200)
        .expect({id: '12', userId: '456'});

      await request(app.callback())
        .get('/param/param/12')
        .expect(200)
        .expect('12');

      await request(app.callback())
        .post('/param/body')
        .type('form')
        .send({ id: '1' })
        .expect(200)
        .expect({id: '1'});

      await request(app.callback())
        .get('/param/body_id')
        .type('form')
        .send({ id: '1' })
        .expect(200)
        .expect('1');

      await request(app.callback())
        .get('/param/session')
        .expect('{}');

      await request(app.callback())
        .get('/param/headers')
        .expect(200)
        .expect('127');

      await request(app.callback())
        .get('/param/headers_host')
        .expect(200)
        .expect('127');

      const imagePath = path.join(__dirname, 'fixtures/enhance', 'base-app-decorator', '1.jpg');
      const imagePath1 = path.join(__dirname, 'fixtures/enhance', 'base-app-decorator', '2.jpg');

      await app.httpRequest()
        .post('/param/file')
        .field('name', 'form')
        .attach('file', imagePath)
        .expect('ok');

      await app.httpRequest()
        .get('/public/form.jpg')
        .expect('content-length', '16424')
        .expect(200);

      await app.httpRequest()
        .post('/param/files')
        .field('name1', '1')
        .attach('file1', imagePath)
        .field('name2', '2')
        .attach('file2', imagePath1)
        .field('name3', '3')
        .expect('ok');

      await app.httpRequest()
        .get('/public/1.jpg')
        .expect('content-length', '16424')
        .expect(200);

      await app.httpRequest()
        .get('/public/2.jpg')
        .expect('content-length', '16424')
        .expect(200);

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
        .expect('64t', done);
    });
  });

  describe('should support multi router in one function', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-router', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should invoke different router and get same result', (done) => {
      done = pedding(3, done);
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/home')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/poster')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('should support change route priority', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-router-priority', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should invoke different router and get same result', (done) => {
      done = pedding(3, done);
      request(app.callback())
        .get('/hello')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/world')
        .expect(200)
        .expect('world', done);

      request(app.callback())
        .get('/api/hello')
        .expect(200)
        .expect('api', done);
    });
  });

  describe('plugin can load controller directory directly', () => {
    let app;
    before(() => {
      app = utils.app('enhance/loader-duplicate', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should fix egg-socket.io load controller directory', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });
  });

  describe('load tsx file', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-controller-tsx', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load tsx controller', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect(/react/, done);
    });

  });

  describe('support middleware parameter', () => {
    let app;
    before(() => {
      app = utils.app('enhance/base-app-middleware', {
        typescript: true
      });
      return app.ready();
    });

    after(() => app.close());

    it('should load middleware in controller and router', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('1111444455552224', done);
    });

    it('should support multi-router in one method', (done) => {
      request(app.callback())
        .post('/api/data')
        .expect(200)
        .expect('11114444', done);
    });

  });
});
