import {
  BaseFramework,
  extend,
  IMidwayBootstrapOptions,
  Framework,
  getClassMetadata,
  listModule,
  Utils,
  MidwayInvokeForbiddenError,
  Logger,
  ILogger,
} from '@midwayjs/core';
import {
  Application,
  Context,
  IProcessor,
  IQueue,
  IQueueManager,
  IQueueOptions,
  IWorkerOptions,
} from './interface';
import {
  Job,
  JobsOptions,
  Queue,
  Worker,
  QueueOptions,
  ConnectionOptions,
} from 'bullmq';
import { BULLMQ_PROCESSOR_KEY } from './constants';

export class BullMQQueue extends Queue implements IQueue<Job> {
  constructor(queueName: string, queueOptions: QueueOptions) {
    super(queueName, queueOptions);
  }
  getJob(name: string): Promise<Job> {
    throw new Error('Method not implemented.');
  }

  // bullmq 在 queue.add 新增第一个参数 jobName
  // runJob 与 @midwayjs/bull 保持一致，如果想要使用 jobName 则可以直接调用 queue.add
  public async runJob(data: any, options?: JobsOptions): Promise<Job> {
    const { repeat, ...OtherOptions } = options ?? {};
    if (repeat) {
      return this.upsertJobScheduler(this.name, repeat, {
        name: 'jobName',
        data,
        opts: OtherOptions, // additional job options
      });
    }
    return this.add('jobName', data || {}, options);
  }

  public getQueueName(): string {
    return this.name;
  }
}

@Framework()
export class BullMQFramework
  extends BaseFramework<Application, Context, any>
  implements IQueueManager<BullMQQueue, Job>
{
  private connection: ConnectionOptions;
  private prefix?: string;
  private defaultQueueConfig: IQueueOptions;
  private defaultWorkerConfig: IWorkerOptions;
  private clearRepeatJobWhenStart: boolean;
  private queueMap: Map<string, BullMQQueue> = new Map();
  /** keep a map of workers for gracefully shutdown  */
  private workerMap: Map<string, Worker> = new Map();

  @Logger('bullMQLogger')
  protected bullMQLogger: ILogger;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  public loadConfig() {
    this.connection = this.configService.getConfiguration('bullmq.connection');
    this.prefix = this.configService.getConfiguration('bullmq.prefix');
    this.defaultQueueConfig = this.configService.getConfiguration(
      'bullmq.defaultQueueOptions'
    );
    this.defaultWorkerConfig = this.configService.getConfiguration(
      'bullmq.defaultWorkerOptions'
    );
    this.clearRepeatJobWhenStart = this.configService.getConfiguration(
      'bullmq.clearRepeatJobWhenStart'
    );
  }

  configure() {
    return this.configService.getConfiguration('bullmq');
  }

  getFrameworkName(): string {
    return 'bullmq';
  }

  async run() {
    const processorModules = listModule(BULLMQ_PROCESSOR_KEY);
    for (const mod of processorModules) {
      const options = getClassMetadata(BULLMQ_PROCESSOR_KEY, mod) as {
        queueName: string;
        jobOptions?: JobsOptions;
        queueOptions?: IQueueOptions;
        workerOptions?: IWorkerOptions;
      };
      const { repeat, ...otherOptions } = options.jobOptions ?? {};
      const queueOptions = options.queueOptions ?? {};
      const currentQueue = this.ensureQueue(options.queueName, {
        ...queueOptions,
        defaultJobOptions: otherOptions,
      });
      if (!currentQueue) throw Error('ensureQueue failed');
      // clear old repeat job when start
      if (this.clearRepeatJobWhenStart) {
        const jobs = await currentQueue.getJobSchedulers();
        for (const job of jobs) {
          await currentQueue.removeJobScheduler(job.key);
        }
        // Repeatable in jobOptions is depecrate
        const repeatableJobs = await currentQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
          await currentQueue.removeRepeatableByKey(job.key);
        }
      }

      await this.addProcessor(mod, options.queueName, options.workerOptions);
      if (repeat) {
        await this.runJob(options.queueName, {}, options.jobOptions);
      }
    }
  }

  protected async beforeStop() {
    // loop queueMap and stop all queue
    for (const queue of this.queueMap.values()) {
      await queue.close();
    }
    for (const worker of this.workerMap.values()) {
      await worker.close();
    }
  }

  public createQueue(name: string, queueOptions: IQueueOptions) {
    const queue = new BullMQQueue(
      name,
      extend(true, {}, this.defaultQueueConfig, queueOptions, {
        connection: this.connection,
        prefix: this.prefix,
      })
    );
    this.queueMap.set(name, queue);
    queue.on('error', err => {
      this.bullMQLogger.error(err);
    });
    return queue;
  }

  public getQueue(name: string) {
    return this.queueMap.get(name);
  }

  public ensureQueue(name: string, queueOptions: IQueueOptions) {
    if (!this.queueMap.has(name)) {
      this.createQueue(name, queueOptions);
    }
    return this.queueMap.get(name);
  }

  public getQueueList() {
    return Array.from(this.queueMap.values());
  }

  public getWorker(name: string) {
    return this.workerMap.get(name);
  }

  public async addProcessor(
    processor: new (...args) => IProcessor,
    queueName: string,
    workerOptions?: IWorkerOptions
  ) {
    const queue = this.queueMap.get(queueName);
    if (!queue) throw Error(`queue not found ${queueName}`);

    const worker = new Worker(
      queueName,
      async (job: Job) => {
        const ctx = this.app.createAnonymousContext({
          jobId: job.id,
          job,
          from: processor,
        });

        try {
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
          const result = await Promise.resolve(await fn(ctx));
          ctx.logger.info(
            `complete process job ${job.id} from ${processor.name}`
          );
          return result;
        } catch (err) {
          ctx.logger.error(err);
          return Promise.reject(err);
        }
      },
      extend(true, {}, this.defaultWorkerConfig, workerOptions, {
        connection: this.connection,
        prefix: this.prefix,
      })
    );

    this.workerMap.set(queueName, worker);
  }

  public async runJob(
    queueName: string,
    jobData: any,
    options?: JobsOptions
  ): Promise<Job | undefined> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return await queue.runJob(jobData, options);
    }
  }

  public async getJob(
    queueName: string,
    jobName: string
  ): Promise<Job | undefined> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return queue.getJob(jobName);
    }
  }
}
