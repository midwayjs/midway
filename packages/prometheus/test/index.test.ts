import { createLegacyApp, close, createHttpRequest } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  let app = null;
  beforeAll(async () => {
    app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {
      imports: [koa],
    });
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

