const { createRuntime } = require('@midwayjs/runtime-mock');
const { HTTPTrigger } = require('@midwayjs/serverless-fc-trigger');
const FCApiGatewayTrigger = require('@midwayjs/serverless-fc-trigger')
  .ApiGatewayTrigger;
const { ApiGatewayTrigger } = require('@midwayjs/serverless-scf-trigger');
const { join } = require('path');
const request = require('supertest');

describe('/test/index.test.ts', () => {
  describe('FC test with http trigger', () => {
    let runtime;
    let app;

    before(async () => {
      const entryDir = join(__dirname, './fixtures/eaas-fc');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new HTTPTrigger());
    });

    afterEach(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
      // delete require.cache[require.resolve('./fixtures/eaas/index.js')];
    });

    it('should test with get', done => {
      request(app)
        .get('/get')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect('x-bbbb', 'ccccccc')
        .expect(/Hello World/)
        .expect(200, done);
    });

    it('should test with get and query', done => {
      request(app)
        .get('/get/query')
        .query({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"query":{"b":"1"}}/)
        .expect(200, done);
    });

    it('should test with post', done => {
      request(app)
        .post('/post')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(/Hello World, post/)
        .expect(200, done);
    });

    it('should test with post and body', done => {
      request(app)
        .post('/post/body')
        .send({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"body":{"b":1}}/)
        .expect(200, done);
    });

    it('should test static file', done => {
      request(app)
        .get('/public/news.css')
        .expect('Content-Type', 'text/css; charset=utf-8')
        .expect(/font-size/)
        .expect(200, done);
    });

    it('should test redirect router', done => {
      request(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(301, done);
    });
  });

  describe('FC test with api gateway', () => {
    let runtime;
    let app;

    before(async () => {
      const entryDir = join(__dirname, './fixtures/eaas-fc');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new FCApiGatewayTrigger());
    });

    after(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
    });

    it('should test with get', done => {
      request(app)
        .get('/get')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/Hello World/)
        .expect(200, done);
    });

    it('should test with get and query', done => {
      request(app)
        .get('/get/query')
        .query({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"query":{"b":"1"}}/)
        .expect(200, done);
    });

    it('should test with post', done => {
      request(app)
        .post('/post')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(/Hello World, post/)
        .expect(200, done);
    });

    it('should test with post and body', done => {
      request(app)
        .post('/post/body')
        .send({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"body":{"b":1}}/)
        .expect(200, done);
    });

    it('should test static file', done => {
      request(app)
        .get('/public/news.css')
        .expect('Content-Type', 'text/css; charset=utf-8')
        .expect(/font-size/)
        .expect(200, done);
    });

    it('should test redirect router', done => {
      request(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(301, done);
    });
  });

  describe('SCF test with api gateway', () => {
    let runtime;
    let app;

    before(async () => {
      const entryDir = join(__dirname, './fixtures/eaas-scf');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new ApiGatewayTrigger());
    });

    after(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
    });

    it('should test with get', done => {
      request(app)
        .get('/get')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/Hello World/)
        .expect(200, done);
    });

    it('should test with get and query', done => {
      request(app)
        .get('/get/query')
        .query({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"query":{"b":"1"}}/)
        .expect(200, done);
    });

    it('should test with post', done => {
      request(app)
        .post('/post')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(/Hello World, post/)
        .expect(200, done);
    });

    it('should test with post and body', done => {
      request(app)
        .post('/post/body')
        .send({
          b: 1,
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"body":{"b":1}}/)
        .expect(200, done);
    });

    it('should test static file', done => {
      request(app)
        .get('/public/news.css')
        .expect('Content-Type', 'text/css; charset=utf-8')
        .expect(/font-size/)
        .expect(200, done);
    });

    it('should test redirect router', done => {
      request(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(301, done);
    });
  });
});
