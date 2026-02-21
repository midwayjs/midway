import { createLegacyApp, close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { MidwayTraceService, sleep } from '@midwayjs/core';
import * as cron from '../src';
import { IJob, Job } from '../src';

describe(`/test/index.test.ts`, () => {
  it('test job with decorator and start', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {
      imports: [cron],
    });
    await sleep(5 * 1000);
    let res = app.getAttr(`task`);
    expect(res).toEqual(1);
    await close(app);
  });

  it('test job throw error and running next', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-err'), {
      imports: [cron],
    });
    await sleep(5 * 1000);
    await close(app);
  });

  it('should test get job name with string and class', async () => {
    @Job('syncJob', {
      cronTime: '*/2 * * * * *', // 每隔 2s 执行
    })
    class DataSyncCheckerJob implements IJob {
      async onTick() {
        console.log('syncJob');
      }
    }
    const app = await createLightApp({
      imports: [
        cron
      ],
      preloadModules: [
        DataSyncCheckerJob
      ]
    });

    const framework = app.getFramework() as cron.Framework;

    expect(framework.getJob(DataSyncCheckerJob)).toBeTruthy();
    expect(framework.getJob('syncJob')).toBeTruthy();
    await close(app);
  });

  it('should create entry span when cron job runs', async () => {
    @Job('traceJob', {
      cronTime: '*/10 * * * * *',
      start: true,
      runOnInit: true,
    })
    class TraceJob implements IJob {
      async onTick() {
        return;
      }
    }

    const app = await createLightApp({
      imports: [cron],
      preloadModules: [TraceJob],
    });
    const traceService = await app
      .getApplicationContext()
      .getAsync(MidwayTraceService);
    const rawRunWithEntrySpan = traceService.runWithEntrySpan.bind(traceService);
    let called = 0;
    traceService.runWithEntrySpan = async (...args: any[]) => {
      called++;
      return rawRunWithEntrySpan(...args);
    };

    await sleep(1000);
    expect(called).toBeGreaterThan(0);
    await close(app);
  });
});
