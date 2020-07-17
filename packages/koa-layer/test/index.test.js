const { createRuntime } = require('@midwayjs/runtime-mock');
const { HTTPTrigger } = require('@midwayjs/serverless-fc-trigger');
const { ApiGatewayTrigger } = require('@midwayjs/serverless-scf-trigger');
const { join } = require('path');
const request = require('supertest');

describe('/test/index.test.ts', () => {
  describe('FC test', () => {
    let runtime;
    let app;

    before(async () => {
      const entryDir = join(__dirname, './fixtures/app');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      app = await runtime.delegate(new HTTPTrigger());
    });

    after(() => {
      if (runtime) {
        runtime.close();
      }
      process.env.ENTRY_DIR = '';
      // delete require.cache[require.resolve('./fixtures/app/index.js')];
    });

    it('should test with get', done => {
      request(app)
        .get('/get')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(/Hello World/)
        .expect(200, done);
    });

    it('should test with post', done => {
      request(app)
        .post('/post')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(/Hello World, post/)
        .expect(200, done);
    });
  });

  describe('SCF test', () => {
    let runtime;

    afterEach(() => {
      if (runtime) {
        runtime.close();
      }
    });

    it('should test with supertest', async () => {
      const entryDir = join(__dirname, './fixtures/app');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      const app = await runtime.delegate(new ApiGatewayTrigger());
      return new Promise(resolve => {
        request(app)
          .get('/user')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(/hello Alan/)
          .expect(200, resolve);
      });
    });
  });
});
