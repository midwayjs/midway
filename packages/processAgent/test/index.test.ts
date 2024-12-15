import { createLegacyApp, close } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  let app = null;
  beforeAll(async () => {
    app = await createLegacyApp(join(__dirname, 'fixtures', 'primary-demo'), {
      imports: [koa],
    });
  });

  afterAll(async () => {
    await close(app);
  })
  it('should get metrics', async () => {
    let userService = await app.getApplicationContext().getAsync('userService');
    let res = await userService.getUser();
    expect(res).toBe(3);
  });

});

