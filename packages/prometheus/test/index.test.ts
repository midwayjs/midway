import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  let app = null;
  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, Framework);
  });

  afterAll(async () => {
    await close(app);
  })
  it('should get metrics', done => {
    createHttpRequest(app)
      .get('/metrics')
      .expect(200, done)
  });
});

