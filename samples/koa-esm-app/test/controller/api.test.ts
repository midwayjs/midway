import { createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';
import assert from 'assert';
import { getApp } from '../setup.js';

describe('test/controller/home.test.ts', () => {

  it('should POST /api/get_user', async function (this: any) {
    const app: Application = getApp();
    // make request
    const result = await createHttpRequest(app).get('/api/get_user').query({ uid: 123 });

    // use expect by jest
    assert(result.status ===200);
    assert(result.body.message === 'OK');
  });
});
