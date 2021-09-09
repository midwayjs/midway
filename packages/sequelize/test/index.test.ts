import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa'
import { join } from 'path';
import { UserService } from './fixtures/sequelize-demo/src/service/user'

describe('/test/index.test.ts', () => {
  let app = null;
  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'sequelize-demo'), {}, Framework);
  });

  afterAll(async () => {
    await close(app);
  })
  it('list user service ', async () => {
    let userService: UserService = await app.getApplicationContext().getAsync(UserService);
    let result = await userService.list();
    expect(result.length).toBe(0)
  });

  it('list hello service ', async () => {
    let userService: UserService = await app.getApplicationContext().getAsync(UserService);
    let result = await userService.listHello();
    expect(result.length).toBe(0);
  });

  it('add and delete', async () => {
    let userService: UserService = await app.getApplicationContext().getAsync(UserService);
    await userService.add();
    let result = await userService.list();
    expect(result.length).toBe(1)
    await userService.delete();
    result = await userService.list();
    expect(result.length).toBe(0)
  });
});
