import { createRuntime } from '@midwayjs/runtime-mock';
import { HTTPTrigger } from '@midwayjs/serverless-fc-trigger';
import { join } from 'path';
import * as request from 'supertest';

describe('/test/index.test.ts', () => {
  describe('should test http trigger use app directly', () => {
    let app;
    let runtime;
    before(async () => {
      runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/eaas'),
      });
      await runtime.start();
      app = await runtime.delegate(new HTTPTrigger());
    });

    before(() => runtime.close());

    it('should test with supertest', (done) => {
      request(app)
        .get('/user')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/hello Alan/)
        .expect(200, done);
    });
  });
  // it('basic test while return Buffer', async () => {
  //   const runtime = createRuntime({
  //     functionDir: path.join(__dirname, './fixtures/eaas'),
  //     layers: [eggLayer],
  //   });
  //   await runtime.start();
  //   const result = await runtime.invoke({
  //     path: '/buffer',
  //     header: {},
  //     query: {},
  //   });
  //   assert(result === 'hi, egg');
  //   await runtime.close();
  // });
});
