import path = require('path');
import * as assert from 'assert';
import { createRuntime } from '@midwayjs/runtime-mock';
import { HTTPTrigger } from '@midwayjs/serverless-fc-trigger';
import eggLayer from '../src';

describe('/test/index.test.ts', () => {
  it.only('basic test', async () => {
    const runtime = createRuntime({
      functionDir: path.join(__dirname, './fixtures/eaas'),
    });
    await runtime.start();
    const result = await runtime.invoke(new HTTPTrigger({
      path: '/',
      method: 'GET'
    }));
    assert(result === 'hi, egg');
    await runtime.close();
  });
  it('basic test while return Buffer', async () => {
    const runtime = createRuntime({
      functionDir: path.join(__dirname, './fixtures/eaas'),
      layers: [eggLayer],
    });
    await runtime.start();
    const result = await runtime.invoke({
      path: '/buffer',
      header: {},
      query: {},
    });
    assert(result === 'hi, egg');
    await runtime.close();
  });
});
