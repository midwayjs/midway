import { createRuntime, HTTPEvent } from '../src';
import { join } from 'path';

const assert = require('assert');

describe('/test/index.test.ts', () => {
  it('should create runtime', async () => {
    const runtime = createRuntime({
      functionDir: join(__dirname, './code'),
      events: [new HTTPEvent()]
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
  });

});
