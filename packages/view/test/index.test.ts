import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa'
import { join } from 'path';

describe('/test/index.test.ts', () => {

  it('should test create viewManager', async () => {
    let app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, Framework);
    let result = await createHttpRequest(app)
      .get('/render');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ejs');
    result = await createHttpRequest(app)
      .get('/renderString');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('ejs');
    await close(app);
  });
});
