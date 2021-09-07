import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { join } from 'path';
import * as assert from 'power-assert';

describe('/test/index.test.ts', () => {

  let app = null;
  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'primary-demo'), {}, Framework);
  });

  afterAll(async () => {
    await close(app);
  })
  it('should get metrics', async (done) => {
    let userService = await app.getApplicationContext().getAsync('userService');
    let res = await userService.getUser();
    assert.equal(res, 3);
    done();
  });

});

