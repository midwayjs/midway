import { createRuntime } from '@midwayjs/runtime-mock';
import * as assert from 'assert';
// 这里不能用包引，会循环依赖
import { HTTPTrigger } from '../src';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should invoke normal code', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/http'),
    });
    await runtime.start();
    const trigger = new HTTPTrigger({
      path: '/help',
      method: 'GET',
    });
    const result = await runtime.invoke(trigger);
    assert.equal(JSON.parse(result.body).path, '/help');
    assert.equal(result.statusCode, 401);
    await runtime.close();
  });
  it('should get string response', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/http'),
    });
    await runtime.start();
    const trigger = new HTTPTrigger({
      path: '/help',
      method: 'GET',
      query: {
        str: true
      }
    });
    const result = await runtime.invoke(trigger);
    assert.equal(result.body, '123');
    assert(result.headers['content-type'].includes('text/plain'));
    await runtime.close();
  });
  it('should get buffer response', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './fixtures/http'),
    });
    await runtime.start();
    const trigger = new HTTPTrigger({
      path: '/help',
      method: 'GET',
      query: {
        buffer: true
      }
    });
    const result = await runtime.invoke(trigger);
    assert.equal(result.body, '123');
    assert.equal(result.statusCode, 401);
    assert.equal(result.headers['content-type'], 'application/octet-stream');
    await runtime.close();
  });
});