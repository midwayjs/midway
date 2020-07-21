import { createRuntime } from '@midwayjs/runtime-mock';
import { HTTPTrigger } from '@midwayjs/serverless-fc-trigger';
import { ApiGatewayTrigger } from '@midwayjs/serverless-scf-trigger';
import { join } from 'path';
import * as request from 'supertest';
import * as assert from 'assert';

describe('/test/index.test.ts', () => {
  describe('should test http trigger use app directly', () => {
    let runtime;

    afterEach(() => {
      if (runtime) {
        runtime.close();
      }
      delete require.cache[require.resolve('./fixtures/eaas/index.js')];
    });

    it('should test with supertest', async () => {
      const entryDir = join(__dirname, './fixtures/eaas');
      process.env.ENTRY_DIR = entryDir;
      runtime = createRuntime({
        functionDir: entryDir,
      });
      await runtime.start();
      const app = await runtime.delegate(new HTTPTrigger());
      return new Promise(resolve => {
        request(app)
          .get('/user')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(/hello Alan/)
          .expect(200, resolve);
      });
    });
  });

  describe('SCF should test apigateway trigger use app directly', () => {
    let runtime;

    afterEach(() => {
      if (runtime) {
        runtime.close();
      }
    });

    it('should test with supertest', async () => {
      const entryDir = join(__dirname, './fixtures/eaas');
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
  it.only('basic test while return Buffer', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/eaas'),
    });
    await runtime.start();
    const result = await runtime.invoke(
      {
        path: '/buffer',
        header: {},
        query: {},
      },
      {}
    );

    assert.ok(result === 'hi, egg');
    await runtime.close();
  });
});
