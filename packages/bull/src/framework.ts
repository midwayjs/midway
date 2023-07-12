import {
  BaseFramework,
  extend,
  IMidwayBootstrapOptions,
  Framework,
  getClassMetadata,
  listModule,
  Utils,
  MidwayInvokeForbiddenError,
} from '@midwayjs/core';
import {
  Application,
  Context,
  IProcessor,
  IQueue,
  IQueueManager,
} from './interface';
import { Job, JobOptions, QueueOptions } from 'bull';
import Bull = require('bull');
import { BULL_PROCESSOR_KEY } from './constants';

export class BullQueue extends Bull implements IQueue<Job> {
  constructor(queueName: string, queueOptions: QueueOptions) {
    super(queueName, queueOptions);
  }

  public async runJob(data: any, options?: JobOptions): Promise<Job> {
    return this.add(data || {}, options) as unknown as Job;
  }

  public getQueueName(): string {
    return this.name;
  }
}

@Framework()
export class BullFramework
  extends BaseFramework<Application, Context, any>
  implements IQueueManager<BullQueue, Job>
{
  private bullDefaultQueueConfig: Bull.QueueOptions;
  private bullDefaultConcurrency: number;
  private bullClearRepeatJobWhenStart: boolean;
  private queueMap: Map<string, BullQueue> = new Map();

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  public loadConfig() {
    this.bullDefaultQueueConfig = this.configService.getConfiguration(
      'bull.defaultQueueOptions'
    );
    this.bullDefaultConcurrency = this.configService.getConfiguration(
      'bull.defaultConcurrency'
    );
    this.bullClearRepeatJobWhenStart = this.configService.getConfiguration(
      'bull.clearRepeatJobWhenStart'
    );
  }

  configure() {
    return this.configService.getConfiguration('bull');
  }

  getFrameworkName(): string {
    return 'bull';
  }

  async run() {
    const processorModules = listModule(BULL_PROCESSOR_KEY);
    for (const mod of processorModules) {
      const options = getClassMetadata(BULL_PROCESSOR_KEY, mod) as {
        queueName: string;
        concurrency: number;
        jobOptions?: JobOptions;
        queueOptions?: QueueOptions;
      };

      const { repeat, delay, ...otherOptions } = options.jobOptions ?? {};
      const queueOptions = options.queueOptions ?? {};
      const currentQueue = this.ensureQueue(options.queueName, {
        ...queueOptions,
        defaultJobOptions: otherOptions,
      });
      // clear old repeat job when start
      if (this.bullClearRepeatJobWhenStart) {
        const jobs = await currentQueue.getRepeatableJobs();
        for (const job of jobs) {
          await currentQueue.removeRepeatableByKey(job.key);
        }
      }
      await this.addProcessor(mod, options.queueName, options.concurrency);
      if (options.jobOptions?.repeat) {
        await this.runJob(options.queueName, {}, options.jobOptions);
      }
    }
  }

  protected async beforeStop() {
    // loop queueMap and stop all queue
    for (const queue of this.queueMap.values()) {
      await queue.close();
    }
  }

  public createQueue(name: string, queueOptions: QueueOptions = {}) {
    const queue = new BullQueue(
      name,
      extend(true, {}, this.bullDefaultQueueConfig, queueOptions)
    );
    this.queueMap.set(name, queue);
    return queue;
  }

  public getQueue(name: string) {
    return this.queueMap.get(name);
  }

  public ensureQueue(name: string, queueOptions: QueueOptions = {}) {
    if (!this.queueMap.has(name)) {
      this.createQueue(name, queueOptions);
    }
    return this.queueMap.get(name);
  }

  public getQueueList() {
    return Array.from(this.queueMap.values());
  }

  public async addProcessor(
    processor: new (...args) => IProcessor,
    queueName: string | BullQueue,
    concurrency?: number
  ) {
    const queue =
      typeof queueName === 'string' ? this.queueMap.get(queueName) : queueName;

    queue.process(concurrency ?? this.bullDefaultConcurrency, async job => {
      const ctx = this.app.createAnonymousContext({
        jobId: job.id,
        job,
        from: processor,
      });

      ctx.logger.info(`start process job ${job.id} from ${processor.name}`);

      const isPassed = await this.app
        .getFramework()
        .runGuard(ctx, processor, 'execute');
      if (!isPassed) {
        throw new MidwayInvokeForbiddenError('execute', processor);
      }

      const service = await ctx.requestContext.getAsync<IProcessor>(
        processor as any
      );
      const fn = await this.applyMiddleware(async ctx => {
        return await Utils.toAsyncFunction(service.execute.bind(service))(
          job.data,
          job
        );
      });

      try {
        const result = await Promise.resolve(await fn(ctx));
        ctx.logger.info(
          `complete process job ${job.id} from ${processor.name}`
        );
        return result;
      } catch (err) {
        ctx.logger.error(err);
        return Promise.reject(err);
      }
    });
  }

  public async runJob(
    queueName: string,
    jobData: any,
    options?: JobOptions
  ): Promise<Job | undefined> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return await queue.runJob(jobData, options);
    }
  }

  public async getJob(queueName: string, jobName: string): Promise<Job> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return queue.getJob(jobName);
    }
  }
}
