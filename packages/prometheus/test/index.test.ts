import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { join } from 'path';
const request = require('supertest');

describe('/test/index.test.ts', () => {

  let app = null;
  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, Framework);
  });

  afterAll(async () => {
    await close(app);
  })
  it('should get metrics', done => {

    request(app.callback())
      .get('/metrics')
      .expect(200, done)
  });
});

