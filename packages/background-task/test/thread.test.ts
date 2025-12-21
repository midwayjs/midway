import { close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as bg from '../src';

describe('runInWorkerThread (Thread Mode)', () => {
  const workerFile = join(__dirname, 'fixtures/base-app/worker/compute.worker.js');

  it('should execute worker file in thread', async () => {
    const app = await createLightApp({
      imports: [bg],
    });

    const framework = app.getFramework() as bg.Framework;

    const result = await framework.runInWorkerThread(workerFile, {
      handler: 'compute',
      payload: { value: 10 },
    });

    expect(result).toBe(20); // value * 2

    await close(app);
  });

  it('should work without options', async () => {
    const app = await createLightApp({
      imports: [bg],
    });

    const framework = app.getFramework() as bg.Framework;

    // compute.worker.js 的默认导出
    const result = await framework.runInWorkerThread(workerFile, {
      handler: 'compute',
    });

    expect(result).toBe(0); // undefined * 2 = NaN, but (undefined || 0) * 2 = 0

    await close(app);
  });

  it('should call onComplete callback', async () => {
    const app = await createLightApp({
      imports: [bg],
    });

    const framework = app.getFramework() as bg.Framework;
    let callbackResult: number | undefined;

    await framework.runInWorkerThread(workerFile, {
      handler: 'compute',
      payload: { value: 5 },
      onComplete: res => {
        callbackResult = res;
      },
    });

    expect(callbackResult).toBe(10);

    await close(app);
  });

  it('should call onError callback when worker fails', async () => {
    const app = await createLightApp({
      imports: [bg],
    });

    const framework = app.getFramework() as bg.Framework;
    let errorCaught: Error | undefined;

    const errorWorkerFile = join(
      __dirname,
      'fixtures/base-app/worker/error.worker.js'
    );

    await expect(
      framework.runInWorkerThread(errorWorkerFile, {
        handler: 'throwError',
        onError: err => {
          errorCaught = err;
        },
      })
    ).rejects.toThrow();

    expect(errorCaught).toBeDefined();

    await close(app);
  });

  it('should track task status', async () => {
    const app = await createLightApp({
      imports: [bg],
    });

    const framework = app.getFramework() as bg.Framework;

    const promise = framework.runInWorkerThread(workerFile, {
      handler: 'compute',
      payload: { value: 10 },
      taskName: 'workerTask',
    });

    // 任务正在运行
    let status = framework.getTaskStatus('workerTask');
    expect(status?.status).toBe('running');

    await promise;

    status = framework.getTaskStatus('workerTask');
    expect(status?.status).toBe('completed');

    await close(app);
  });
});
