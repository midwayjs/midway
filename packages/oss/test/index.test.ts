import { LightFramework } from '@midwayjs/core';
import { join } from 'path';
import { OSSService, OSSServiceFactory } from '../src';

describe('/test/index.test.ts', () => {

  let ossService;
  let container;
  let framework;

  beforeAll(async () => {
    framework = new LightFramework();
    framework.configure();
    await framework.initialize({ baseDir: join(__dirname, './fixtures/base-app/src') });
    container = framework.getApplicationContext();
    ossService = await container.getAsync(OSSService);
  });

  it('should test oss service singleton', async () => {
    expect(ossService).toBeDefined();
    const ossService2 = await container.getAsync(OSSService);
    expect(ossService).toEqual(ossService2);
  });

  it('should test oss service factory', async () => {
    const factory: OSSServiceFactory = await container.getAsync(OSSServiceFactory);
    expect(factory).toBeDefined();
  });
});
