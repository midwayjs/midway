import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import * as assert from 'assert';

describe('test/controller/home.test.ts', () => {

  it('should POST /api/get_user', async () => {
    // create app
    const app = await createApp<Framework>();

    // make request
    const result = await createHttpRequest(app).post('/api/get_user').query({ uid: 123 });

    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('OK');

    // or use assert
    assert.deepStrictEqual(result.status, 200);
    assert.deepStrictEqual(result.body.data.uid, '123');

    // close app
    await close(app);
  });
});
