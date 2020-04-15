import { createRuntime } from '@midwayjs/runtime-mock';
import { join } from 'path';
import {
  ApiGatewayTrigger,
  CDNTrigger,
  HTTPTrigger,
  OSSTrigger,
  SLSTrigger,
  TimerTrigger,
  FCBaseTrigger,
} from '../src';
import * as assert from 'assert';
import * as request from 'supertest';

describe('/test/index.test.ts', () => {
  it('should use event', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/event'),
    });
    await runtime.start();
    const result = await runtime.invoke(
      new FCBaseTrigger({
        bbb: 111,
      })
    );
    assert.deepEqual(result, { bbb: 111 });
    await runtime.close();
  });

  it('should use origin http trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/http'),
    });
    await runtime.start();
    const result = await runtime.invoke(
      new HTTPTrigger({
        path: '/help',
        method: 'GET',
      })
    );
    assert.equal(result.body, 'hello Alan');
    await runtime.close();
  });

  describe('should test http trigger use app directly', () => {
    let app;
    let runtime;
    before(async () => {
      runtime = createRuntime({
        functionDir: join(__dirname, './fixtures/http'),
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

  it('should use origin api gateway', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/apiGateway'),
    });
    await runtime.start();
    const result = await runtime.invoke(
      new ApiGatewayTrigger({
        headers: {
          'Content-Type': 'text/json',
        },
        method: 'POST',
        query: {
          q: 'testq',
        },
        pathParameters: {
          id: 'id',
        },
        path: '/test',
        body: {
          name: 'test',
        },
      })
    );
    assert.equal(result.body, 'hello Alan');
    await runtime.close();
  });

  it('should use origin oss trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/oss'),
    });
    await runtime.start();
    const result = await runtime.invoke(new OSSTrigger());
    assert(result.events.length > 0);
    await runtime.close();
  });

  it('should use origin cdn trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/cdn'),
    });
    await runtime.start();
    const result = await runtime.invoke(new CDNTrigger());
    assert(result.events.length > 0);
    await runtime.close();
  });

  it('should use origin sls trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/sls'),
    });
    await runtime.start();
    const result = await runtime.invoke(new SLSTrigger());
    assert(result.taskId);
    await runtime.close();
  });

  it('should use origin timer trigger', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/timer'),
    });
    await runtime.start();
    const result = await runtime.invoke(new TimerTrigger());
    assert(result.triggerTime);
    await runtime.close();
  });
});
