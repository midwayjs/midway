import { close, createApp, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as piscina from '../src';

describe('PiscinaService', () => {
  const workerFile = join(
    __dirname,
    'fixtures/worker/compute.worker.ts'
  );

  it('should execute worker task with run', async () => {
    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile,
          },
        },
      },
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    const result = await service.run({
      handler: 'compute',
      payload: { value: 10 },
    });

    expect(result).toBe(20); // value * 2

    await close(app);
  });

  it('should work without payload', async () => {
    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile,
          },
        },
      },
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    const result = await service.run({ handler: 'compute' });

    expect(result).toBe(0); // (undefined || 0) * 2 = 0

    await close(app);
  });

  it('should support multiple pools via factory', async () => {
    const errorWorkerFile = join(
      __dirname,
      'fixtures/worker/error.worker.js'
    );

    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          clients: {
            compute: {
              workerFile,
            },
            error: {
              workerFile: errorWorkerFile,
            },
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaServiceFactory);

    // compute pool
    const computePool = factory.get('compute');
    const result = await computePool.run({
      handler: 'compute',
      payload: { value: 5 },
    });
    expect(result).toBe(10);

    // error pool
    const errorPool = factory.get('error');
    await expect(
      errorPool.run({
        handler: 'throwError',
      })
    ).rejects.toThrow();

    await close(app);
  });

  it('should access pool via factory', async () => {
    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile,
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaServiceFactory);

    const pool = factory.get('default');
    expect(pool).toBeDefined();
    expect(pool.threads).toBeDefined();

    await close(app);
  });

  it('should abort task with AbortController', async () => {
    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile,
          },
        },
      },
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    const abortController = new AbortController();

    // 启动长时间运行的任务
    const promise = service.run(
      {
        handler: 'longRunning',
        payload: { duration: 5000 },
      },
      {
        signal: abortController.signal,
      }
    );

    // 100ms 后取消
    setTimeout(() => {
      abortController.abort();
    }, 100);

    // 应该抛出 abort 错误
    await expect(promise).rejects.toThrow();

    await close(app);
  });

  it('should work with default export in JS', async () => {
    const defaultWorkerFile = join(
      __dirname,
      'fixtures/worker/default.worker.js'
    );

    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile: defaultWorkerFile,
          },
        },
      },
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    // 默认导出不需要指定 handler
    const result = await service.run({ payload: { value: 10 } });

    expect(result).toBe(30); // value * 3

    await close(app);
  });

  it('should work with default export in TS', async () => {
    const defaultWorkerFile = join(
      __dirname,
      'fixtures/worker/default.worker.ts'
    );

    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile: defaultWorkerFile,
          },
        },
      },
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    const result = await service.run({ payload: { value: 10 } });

    expect(result).toBe(40); // value * 4

    await close(app);
  });

  it('should merge user config with default options', async () => {
    const app = await createLightApp({
      imports: [piscina],
      globalConfig: {
        piscina: {
          client: {
            workerFile,
            maxThreads: 12,
            minThreads: 2,
          },
        },
      },
    });

    const factory = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaServiceFactory);

    const pool = factory.get('default');
    expect(pool.options.maxThreads).toBe(12);
    expect(pool.options.minThreads).toBe(2);

    await close(app);
  });

  it('should work with @PiscinaTask decorator', async () => {
    const app = await createApp({
      appDir: join(__dirname, 'fixtures/base-app'),
    });

    const service = await app
      .getApplicationContext()
      .getAsync(piscina.PiscinaService);

    // 测试 calculate 任务 - 乘法
    const result1 = await service.runInContainer('calculate', {
      a: 5,
      b: 6,
      operation: 'multiply',
    });
    expect(result1).toBe(30);

    // 测试 calculate 任务 - 加法
    const result2 = await service.runInContainer('calculate', {
      a: 10,
      b: 20,
      operation: 'add',
    });
    expect(result2).toBe(30);

    // 测试 square 任务
    const result3 = await service.runInContainer('square', { value: 7 });
    expect(result3).toBe(49);

    await close(app);
  });
});
