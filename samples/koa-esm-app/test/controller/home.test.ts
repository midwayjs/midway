import { createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import assert from 'assert';
import { getApp } from '../setup.js';

describe('test/controller/home.test.ts', () => {

  it('should GET /', async () => {
    const app: Application = getApp();
    // make request
    const result = await createHttpRequest(app).get('/');

    // use expect by jest
    assert(result.status === 200);
    assert(result.text === 'Hello Midwayjs!');
  });

});
