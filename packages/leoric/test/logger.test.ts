import { close, createHttpRequest, createLegacyApp } from '@midwayjs/mock';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { IMidwayApplication } from '@midwayjs/core';
import { UserService } from './fixtures/logger/src/service/user';
import { readFile } from 'fs/promises';

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

describe('test/logger.test.ts', () => {
  let app: IMidwayApplication;
  let userService: UserService;

  beforeAll(async () => {
    cleanFile(join(__dirname, 'fixtures/logger', 'database.sqlite'));
    app = await createLegacyApp(join(__dirname, 'fixtures', 'logger'));
    userService = await app
      .getApplicationContext()
      .getAsync(UserService);
  });

  afterAll(async () => {
    await close(app);
  });

  beforeEach(async () => {
    await userService.add({ name: 'Levi', birthday: new Date('2023-12-25') });
  });

  afterEach(async () => {
    await userService.delete();
  });

  it('list user', async () => {
    const res = await createHttpRequest(app)
      .get('/api/users')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toEqual('Levi');
    const fpath = join(__dirname, 'fixtures/logger/logs/midwayjs-leoric-logger/midway-app.log');
    expect(await readFile(fpath, 'utf-8')).toContain('SELECT * FROM "users"');
  });

});
