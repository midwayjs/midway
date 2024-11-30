import { createApp, close } from '@midwayjs/mock';
import { join } from 'path';
import { sleep } from '@midwayjs/core';
import * as bull from '../src';
import { readFileSync } from 'fs';

describe(`/test/index.test.ts`, () => {
  it('test auto repeat processor', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, bull);

    await sleep(5 * 1000);
    let res = app.getAttr(`task`);
    expect(res).toEqual(`task`);

    // run job
    const bullFramework = app.getApplicationContext().get(bull.Framework);
    expect(bullFramework.getCoreLogger()).toBeDefined();
    const testQueue = bullFramework.getQueue('test');
    expect(testQueue).toBeDefined();

    const params = {
      name: 'stone-jin',
    };
    const job = await testQueue?.runJob(params, { delay: 1000 });
    expect(await job?.getState()).toEqual('delayed');
    await sleep(1200);
    expect(app.getAttr(`queueConfig`)).toBe(JSON.stringify(params));
    expect(await job?.getState()).toEqual('completed');

    await close(app);
  });

  it('test processor with redis', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app-redis'), {}, bull);

    await sleep(5 * 1000);

    expect(app.getAttr(`task`)).toBe('task');

    await close(app);
  });

  it('should test throw error when create service', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app-error-out-of-job'), {}, bull);
    await sleep(5 * 1000);
    expect(readFileSync(join(__dirname, 'fixtures', 'base-app-error-out-of-job', 'logs', 'ali-demo', 'midway-bull.log'), 'utf8').includes('MidwayDefinitionNotFoundError')).toBeTruthy();
    await close(app);
  });

  it('test processor only create, not execute', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app-only-create'), {}, bull);

    await sleep(5 * 1000);

    // run job
    const bullFramework = app.getApplicationContext().get(bull.Framework);
    expect(bullFramework.getCoreLogger()).toBeDefined();
    const testQueue = bullFramework.getQueue('test');
    expect(testQueue).toBeDefined();

    const params = {
      name: 'stone-jin',
    };
    const job = await testQueue?.runJob(params, { delay: 1000 });
    expect(await job?.getState()).toEqual('delayed');
    await sleep(1200);
    expect(await job?.getState()).toEqual('delayed');

    await close(app);
  });
});

// describe('test another duplicated error', function () {
//   it('should throw error when start with duplicate task', async () => {
//     let error;
//     try {
//       await createApp(
//         join(__dirname, 'fixtures', 'base-app-duplicate-task'),
//         {},
//         TaskModule
//       );
//     } catch (err) {
//       error = err;
//     }
//     expect(error).toBeDefined();
//   });
//
//   it('should throw error when start with duplicate local task', async () => {
//     let error;
//     try {
//       await createApp(
//         join(__dirname, 'fixtures', 'base-app-duplicate-local-task'),
//         {},
//         TaskModule
//       );
//     } catch (err) {
//       error = err;
//     }
//     expect(error).toBeDefined();
//   });
// });
