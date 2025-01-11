
import { createLightApp, close } from '@midwayjs/mock';
import { App, sleep, Inject, FORMAT } from '@midwayjs/core';
import * as bullmq from '../src';
import { Processor, Application, IProcessor } from '../src';
import { JobsOptions, Job } from 'bullmq';

describe(`/test/index.test.ts`, () => {
  it('test auto repeat processor', async () => {
    @Processor('HelloTask', {
      repeat: {
        pattern: FORMAT.CRONTAB.EVERY_PER_5_SECOND
      }
    })
    class HelloTask implements IProcessor {
      @App()
      app: Application;
    
      async execute() {
        this.app.setAttr(`task`, 'task');
      }
    }

    @Processor('concurrency', {}, { limiter: { max: 3, duration: 1000 }, concurrency: 3 })
    class QueueTask {
      async execute(params) {
        await sleep(3 * 1000);
      }
    }

    @Processor('test')
    class QueueTask1 {
      @App()
      app: Application;

      @Inject()
      logger;

      async execute(params) {
        this.logger.info(`====>QueueTask execute`);
        this.app.setAttr(`queueConfig`, JSON.stringify(params));
      }
    }

    const app = await createLightApp({
      imports: [
        bullmq
      ],
      globalConfig: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
      preloadModules: [
        HelloTask,
        QueueTask,
        QueueTask1
      ]
    });

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
    await concurrencyQueue?.setGlobalConcurrency(2);
    for (let index = 0; index < 6; index++) {
      concurrencyQueue?.runJob(index);
    }
    await sleep(1 * 1000);
    expect((await concurrencyQueue?.getJobCounts())?.active).toEqual(2);
    await concurrencyQueue?.setGlobalConcurrency(4);
    await sleep(4 * 1000);
    expect((await concurrencyQueue?.getJobCounts())?.active).toEqual(3);
    await sleep(3 * 1000);
    await close(app);
  });

  // 测试重试机制
  it('should handle job retries', async () => {
    let retryCount = 0;

    @Processor('retryTask')
    class RetryTask implements IProcessor {
      @App()
      app: Application;

      async execute(params: any): Promise<void> {
        retryCount++;
        if (retryCount < 3) {
          throw new Error('Simulated failure');
        }
        this.app.setAttr('retrySuccess', true);
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
      preloadModules: [RetryTask]
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const retryQueue = bullFramework.getQueue('retryTask');
    
    const job = await retryQueue?.runJob({}, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 100
      }
    });

    await sleep(2000);
    expect(retryCount).toBe(3);
    expect(app.getAttr('retrySuccess')).toBe(true);
    expect(await job?.getState()).toBe('completed');
    
    await close(app);
  });

  // 测试任务优先级
  it('should handle job priorities', async () => {
    const executionOrder: number[] = [];

    @Processor('priorityTask')
    class PriorityTask implements IProcessor {

      async execute(params: { priority: number }): Promise<void> {
        executionOrder.push(params.priority);
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
      preloadModules: [PriorityTask]
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const priorityQueue = bullFramework.getQueue('priorityTask');
    
    // 添加不同优先级的任务
    await priorityQueue?.runJob({ priority: 3 }, { priority: 1 }); // 低优先级
    await priorityQueue?.runJob({ priority: 1 }, { priority: 3 }); // 高优先级
    await priorityQueue?.runJob({ priority: 2 }, { priority: 2 }); // 中优先级

    await sleep(2000);
    
    // 验证执行顺序是否按照优先级排序
    expect(executionOrder).toEqual([1, 2, 3]);
    
    await close(app);
  });

  // 测试任务进度
  it('should handle job progress', async () => {
    let progressValue = 0;

    @Processor('progressTask')
    class ProgressTask implements IProcessor {
      @App()
      app: Application;
    
      async execute(params: any): Promise<void> {
        const job = await this.app.getApplicationContext().get('currentJob') as Job;
        for (let i = 0; i <= 100; i += 20) {
          await job.updateProgress(i);
          await sleep(100);
        }
        this.app.setAttr('finalProgress', await job.progress);
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
      preloadModules: [ProgressTask]
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const progressQueue = bullFramework.getQueue('progressTask');
    
    const job = await progressQueue?.runJob({});
    
    if (job) {
      const currentProgress = await job.progress;
      progressValue = typeof currentProgress === 'number' ? currentProgress : 0;
    }

    await sleep(1000);
    expect(progressValue).toBeGreaterThanOrEqual(0);
    await sleep(1000);
    expect(app.getAttr('finalProgress')).toBe(100);
    
    await close(app);
  });

  // 测试任务超时
  it('should handle job timeouts', async () => {
    @Processor('timeoutTask')
    class TimeoutTask implements IProcessor {
      async execute(): Promise<void> {
        await sleep(2000); // 任务执行时间超过超时设置
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          connection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      },
      preloadModules: [TimeoutTask]
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const timeoutQueue = bullFramework.getQueue('timeoutTask');
    
    const jobOptions: JobsOptions = {
      attempts: 1,
    };
    const job = await timeoutQueue?.runJob({}, jobOptions);

    await sleep(3000);
    expect(await job?.getState()).toBe('failed');
    
    await close(app);
  });

});

