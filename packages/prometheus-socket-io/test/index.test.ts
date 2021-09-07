import { createBootstrap } from '@midwayjs/mock';
import { join } from 'path';
import { MidwayFrameworkType } from '@midwayjs/decorator';
const request = require('supertest');

describe('/test/index.test.ts', () => {

  let bootstrap = null;
  let app = null;
  beforeAll(async () => {
    bootstrap = await createBootstrap(
      join(process.cwd(), 'test', 'fixtures', 'test-prometheus-socket-io', 'bootstrap.js')
    );
    app = bootstrap.getApp(MidwayFrameworkType.WEB);
  });

  afterAll(async () => {

    // close app
    await bootstrap.close();
  })
  it('should get metrics', done => {

    request(app.callback())
      .get('/metrics')
      .expect(200, done)
  });
});

