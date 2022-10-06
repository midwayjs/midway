import { BaseFramework, extend, IMidwayBootstrapOptions } from '@midwayjs/core';
import {
  Framework,
  getClassMetadata,
  getProviderName,
  getProviderUUId,
  listModule,
  Utils,
} from '@midwayjs/decorator';
import {
  Application,
  Context,
  IProcessor,
  IQueue,
  IQueueManager,
} from './interface';
import { Job, JobOptions, QueueOptions } from 'bull';
import * as Bull from 'bull';
import { BULL_PROCESSOR_KEY } from './constants';

export class BullQueue extends Bull implements IQueue<Job> {
  constructor(queueName: string, queueOptions: QueueOptions) {
    super(queueName, queueOptions);
  }

  public async runJob(data: Record<string, any>, options?: JobOptions) {
    return this.add(data || {}, options);
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
  private bullDefaultConfig: any;
  private queueMap: Map<string, BullQueue> = new Map();

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
    this.bullDefaultConfig = this.configService.getConfiguration(
      'bull.defaultQueueOptions'
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
      };
      this.ensureQueue(options.queueName);
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
      extend(true, this.bullDefaultConfig, queueOptions)
    );
    this.queueMap.set(name, queue);
    return queue;
  }

  public getQueue(name: string) {
    return this.queueMap.get(name);
  }

  public ensureQueue(name: string) {
    if (!this.queueMap.has(name)) {
      this.createQueue(name);
    }
    return this.queueMap.get(name);
  }

  public async addProcessor(
    processor: new (...args) => IProcessor,
    queueName: string | BullQueue,
    concurrency = 1
  ) {
    const queue =
      typeof queueName === 'string' ? this.queueMap.get(queueName) : queueName;

    queue.process(concurrency, async job => {
      const ctx = this.app.createAnonymousContext({
        jobId: job.id,
        triggerName: getProviderName(job),
        triggerUUID: getProviderUUId(job),
      });

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
        return Promise.resolve(await fn(ctx));
      } catch (err) {
        ctx.logger.error(err);
        return Promise.reject(err);
      }
    });
  }

  async runJob(queueName: string, jobData: any, options?: JobOptions) {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      await queue.runJob(jobData, options);
    }
  }

  async getJob(queueName: string, jobName: string): Promise<Job> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return queue.getJob(jobName);
    }
  }
}
