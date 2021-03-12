const { createRuntime } = require('@midwayjs/runtime-mock');
const { HTTPTrigger } = require('@midwayjs/serverless-fc-trigger');
const FCApiGatewayTrigger = require('@midwayjs/serverless-fc-trigger')
  .ApiGatewayTrigger;
const { join } = require('path');
const request = require('supertest');

describe('/test/index.test.ts', () => {
  describe('FC test with http trigger', () => {
    let runtime;
    let app;

    beforeAll(async () => {
      const entryDir = join(__dirname, './fixtures/app-fc');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new HTTPTrigger());
    });

    afterAll(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
    });

    it('should test with get', done => {
      request(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });
  });

  describe('FC test with api gateway', () => {
    let runtime;
    let app;

    beforeAll(async () => {
      const entryDir = join(__dirname, './fixtures/app-fc');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new FCApiGatewayTrigger());
    });

    afterAll(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
    });

    it('should test with get', done => {
      request(app)
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/hello world/)
        .expect(200, done);
    });

    it('should test 404', done => {
      request(app)
        .get('/404')
        .expect(404, done);
    });

  });

  describe('FC test with 404', () => {
    let runtime;
    let app;

    beforeAll(async () => {
      const entryDir = join(__dirname, './fixtures/app-fc-404');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new FCApiGatewayTrigger());
    });

    afterAll(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
    });

    it('should test custom 404 page', done => {
      request(app)
        .get('/404.html')
        .expect(/404/)
        .expect(200, done);
    });

    it('should not exists page and get 404 page', done => {
      request(app)
        .get('/404')
        .expect(/404/)
        .expect(404, done);
    });

  });
});
