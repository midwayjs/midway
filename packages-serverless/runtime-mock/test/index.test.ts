import { createRuntime, HTTPEvent } from '../src';
import { join } from 'path';

const assert = require('assert');

describe('/test/index.test.ts', () => {
  it('should create runtime', async () => {
    let initHanlderResult;
    const runtime = createRuntime({
      functionDir: join(__dirname, './code'),
      events: [new HTTPEvent()],
      initHandler: arg => {
        initHanlderResult = arg;
      },
      initContext: 'test'
    });
    await runtime.start();
    const result = await runtime.invoke({
      path: '/',
      query: {
        name: 'Alan',
      },
    });
    assert.equal(result, 'hello Alan');
    await runtime.close();
    assert.equal(initHanlderResult, 'test');
  });
});
