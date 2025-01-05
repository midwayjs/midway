
import { createApp, close } from '@midwayjs/mock';
import { join } from 'path';
import { sleep } from '@midwayjs/core';
import * as bullmq from '../src';
import expect from 'expect';


describe(`/test/index.test.ts`, () => {
  it('test auto repeat processor', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, bullmq);

    await sleep(5 * 1000);
    let res = app.getAttr(`task`);
    expect(res).toEqual(`task`);

    // run job
    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
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

    const concurrencyQueue = bullFramework.getQueue('concurrency');
    await concurrencyQueue.setGlobalConcurrency(2);
    for (let index = 0; index < 6; index++) {
      concurrencyQueue.runJob(index);
    }
    await sleep(1 * 1000);
    expect((await concurrencyQueue.getJobCounts()).active).toEqual(2);
    await concurrencyQueue.setGlobalConcurrency(4);
    await sleep(4 * 1000);
    expect((await concurrencyQueue.getJobCounts()).active).toEqual(3);
    await sleep(3 * 1000);
    await close(app);
  });

});

