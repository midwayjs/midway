import { createLegacyApp, close } from '@midwayjs/mock';
import { join } from 'path';
import { sleep } from '@midwayjs/core';
import * as cron from '../src';

describe(`/test/index.test.ts`, () => {
  it('test job with decorator and start', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {}, cron);
    await sleep(5 * 1000);
    let res = app.getAttr(`task`);
    expect(res).toEqual(1);
    await close(app);
  });

  it('test job throw error and running next', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-err'), {}, cron);
    await sleep(5 * 1000);
    await close(app);
  });
});
