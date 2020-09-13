import { close, createApp, createHttpRequest } from '../src';
import { Framework } from '../../web/src';

import { Framework as KoaFramework } from '../../web-koa/src';
import { join } from 'path';

describe('/test/new.test.ts', () => {
  it('should test create app', async () => {
    const app = await createApp<Framework>(join(__dirname, 'fixtures/base-app-decorator'), {}, Framework);
    // TODO app 加上 egg-mock 的类型定义
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app);
  });

  it('should test create another app', async () => {
    const app = await createApp<KoaFramework>(join(__dirname, 'fixtures/base-app-new'), {}, KoaFramework);
    const result = await createHttpRequest(app).get('/').query({ name: 'harry' });
    expect(result.status).toBe(200);
    expect(result.text).toBe('hello world, harry');
    await close(app);
  });
});
