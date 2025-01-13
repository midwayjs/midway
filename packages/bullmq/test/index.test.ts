import { createLightApp, close } from '@midwayjs/mock';
import { App, sleep, Inject, FORMAT, MidwayCommonError } from '@midwayjs/core';
import * as bullmq from '../src';
import { Processor, Application, IProcessor, Context } from '../src';
import { JobsOptions, Job } from 'bullmq';
import * as assert from 'node:assert';

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
          defaultConnection: {
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
          defaultConnection: {
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
          defaultConnection: {
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
    await priorityQueue?.runJob({ priority: 3 }, { priority: 3, delay: 100 }); // 低优先级
    await priorityQueue?.runJob({ priority: 2 }, { priority: 2, delay: 100 }); // 中优先级
    await priorityQueue?.runJob({ priority: 1 }, { priority: 1, delay: 100 }); // 高优先级

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

      @Inject()
      ctx: Context;

      async execute(params: any, job: Job): Promise<void> {
        assert(job === this.ctx.job);
        for (let i = 0; i <= 100; i += 20) {
          await job.updateProgress(i);
          await sleep(100);
        }
        this.app.setAttr('finalProgress', job.progress);
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          defaultConnection: {
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
      const currentProgress = job.progress;
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
    // bullmq 不提供 timeout 配置，自行处理超时情况
    @Processor('timeoutTask')
    class TimeoutTask implements IProcessor {
      async execute(): Promise<void> {
        let controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1000);

        try {
          await new Promise((resolve, reject) => {
            const t = setTimeout(() => {
              clearTimeout(timer);
              resolve(true);
            }, 2000);

            controller.signal.addEventListener('abort', () => {
              clearTimeout(t);
              reject(new MidwayCommonError('Task execution timed out'))
            });
          });
        } catch(err) {
          if (err.name == "MidwayCommonError") {
            throw err;
          } else {
            throw new MidwayCommonError('unknown error');
          }
        } finally {
          clearTimeout(timer);
        }
      }
    }

    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          defaultConnection: {
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

  // 测试动态创建队列和任务
  it('should handle dynamic queue and job creation', async () => {
    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          defaultConnection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      }
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);

    // 测试动态创建队列
    const dynamicQueue = bullFramework.createQueue('dynamicQueue', {
      defaultJobOptions: {
        removeOnComplete: 1,
        removeOnFail: 1,
      }
    });

    // 测试创建 worker
    const results: string[] = [];
    const worker = bullFramework.createWorker(
      'dynamicQueue',
      async (job) => {
        results.push(job.data.message);
        return job.data;
      },
      {
        concurrency: 2
      }
    );

    // 添加任务
    await dynamicQueue.runJob({ message: 'task1' });
    await dynamicQueue.runJob({ message: 'task2' });

    await sleep(1000);
    expect(results).toContain('task1');
    expect(results).toContain('task2');

    await worker.close();
    await close(app);
  });

  // 测试 Flow Producer
  it('should handle flow producer', async () => {
    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          defaultConnection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      }
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);

    // 创建队列
    bullFramework.createQueue('flow-queue-1');
    bullFramework.createQueue('flow-queue-2');

    const results: string[] = [];

    // 创建 workers
    bullFramework.createWorker(
      'flow-queue-1',
      async (job) => {
        results.push(`queue1-${job.data.value}`);
        return { value: job.data.value + 1 };
      }
    );

    bullFramework.createWorker(
      'flow-queue-2',
      async (job) => {
        results.push(`queue2-${job.data.value}`);
        return { value: job.data.value + 1 };
      }
    );

    // 创建 flow producer
    const flowProducer = bullFramework.createFlowProducer({}, 'test-flow');

    // 创建任务流
    await flowProducer.add({
      name: 'flow-test',
      queueName: 'flow-queue-1',
      data: { value: 1 },
      children: [
        {
          name: 'child-job',
          queueName: 'flow-queue-2',
          data: { value: 2 }
        }
      ]
    });

    await sleep(2000);
    expect(results).toContain('queue1-1');
    expect(results).toContain('queue2-2');
    await close(app);
  });

  // 测试队列事件
  it('should handle queue events', async () => {
    const app = await createLightApp({
      imports: [bullmq],
      globalConfig: {
        bullmq: {
          defaultConnection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      }
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const eventQueue = bullFramework.createQueue('event-queue');

    const events: string[] = [];
    const queueEvents = eventQueue.createQueueEvents();

    // 监听队列事件
    queueEvents.on('completed', ({ jobId }) => {
      events.push(`completed:${jobId}`);
    });

    queueEvents.on('failed', ({ jobId }) => {
      events.push(`failed:${jobId}`);
    });

    // 创建 worker 并等待其准备就绪
    const worker = bullFramework.createWorker(
      'event-queue',
      async (job) => {
        if (job.data.shouldFail) {
          throw new Error('Task failed');
        }
        return job.data;
      }
    );

    // 等待 worker 准备就绪
    await new Promise<void>(resolve => worker.on('ready', () => resolve()));

    // 添加一个小延迟确保事件监听器已设置
    await sleep(1000);

    const job1 = await eventQueue.runJob({ shouldFail: false });
    const job2 = await eventQueue.runJob({ shouldFail: true });

    // 增加等待时间，确保事件能够被正确捕获
    await sleep(3000);

    expect(events).toContain(`completed:${job1.id}`);
    expect(events).toContain(`failed:${job2.id}`);

    await worker.close();
    await queueEvents.close();
    await close(app);
  });
});

