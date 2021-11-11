import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { close, createLightApp } from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should use one db', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn', 'default.sqlite'));

    const app: IMidwayApplication = await createLightApp(join(__dirname, 'fixtures/base-fn'), {});
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');

    await close(app);
  });

  it.skip('use two db in one config', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'default.sqlite'));
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'test.sqlite'));

    const app: IMidwayApplication = await createLightApp(join(__dirname, 'fixtures/base-fn-multiple-db'), {});
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

