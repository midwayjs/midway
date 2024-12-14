import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { close, createLegacyLightApp } from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test base entity', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-origin', 'default.sqlite'));

    const app: IMidwayApplication = await createLegacyLightApp(join(__dirname, 'fixtures/base-fn-origin'), {});
    const result = app.getAttr<string>('result');

    expect(result.includes('hello world')).toBeTruthy();
    expect(result).toEqual('hello world[[{"id":1,"name":"oneuser1"}],1]');

    await close(app);
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

