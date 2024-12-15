import { close, createLegacyLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { UserService } from './fixtures/basic/src/service/user';
import { IMidwayApplication } from '@midwayjs/core';

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

describe('test/index.test.ts', () => {
  let app: IMidwayApplication;

  beforeAll(async () => {
    cleanFile(join(__dirname, 'fixtures/basic', 'database.sqlite'));
    app = await createLegacyLightApp(join(__dirname, 'fixtures', 'basic'));
  });

  afterAll(async () => {
    await close(app);
  });

  it('list user service ', async () => {
    const userService: UserService = await app
      .getApplicationContext()
      .getAsync(UserService);
    const result = await userService.list();
    expect(result.length).toBe(0);
  });

  it('list hello service ', async () => {
    const userService: UserService = await app
      .getApplicationContext()
      .getAsync(UserService);
    const result = await userService.list();
    expect(result.length).toBe(0);
  });

  it('add and delete', async () => {
    const userService: UserService = await app
      .getApplicationContext()
      .getAsync(UserService);
    await userService.add({ name: 'John' });
    let result = await userService.list();
    expect(result.length).toBe(1);

    result = await userService.list();
    expect(result.length).toBe(1);

    await userService.delete();
    result = await userService.list();
    expect(result.length).toBe(0);
  });
});
