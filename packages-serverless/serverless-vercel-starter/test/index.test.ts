import { createRuntime } from '@midwayjs/runtime-mock';
import * as assert from 'assert';
// 这里不能用包引，会循环依赖
import { HTTPTrigger } from '../../serverless-vercel-trigger/src';
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
    await runtime.close();
  });
});
