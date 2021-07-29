import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { createApp, close } from '@midwayjs/mock';
import { IMidwayApplication, LightFramework } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should use one db', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn', 'default.sqlite'));

    const app: IMidwayApplication = await createApp(join(__dirname, 'fixtures/base-fn'), {}, LightFramework);
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');

    await close(app);
  });

  it('use two db in one config', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'default.sqlite'));
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'test.sqlite'));

    const app: IMidwayApplication = await createApp(join(__dirname, 'fixtures/base-fn-multiple-db'), {}, LightFramework);
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');
  });

  it('test single table inheritance', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'test.sqlite'));

    const app: IMidwayApplication = await createApp(join(__dirname, 'fixtures/base-fn-single-table'), {}, LightFramework);
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"title":"new photo","description":"","size":"100"}],1]');
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

