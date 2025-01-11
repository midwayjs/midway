import {
  BaseFramework,
  IMidwayBootstrapOptions,
  Framework,
  getClassMetadata,
  listModule,
  Utils,
  MidwayInvokeForbiddenError,
  Logger,
  ILogger,
  MidwayCommonError,
} from '@midwayjs/core';
import { Application, Context, IProcessor } from './interface';
import {
  Job,
  JobsOptions,
  Queue,
  Worker,
  QueueOptions,
  WorkerOptions,
  ConnectionOptions,
  QueueEvents,
  QueueEventsProducer,
  QueueBaseOptions,
  QueueEventsOptions,
  FlowProducer,
} from 'bullmq';
import { BULLMQ_PROCESSOR_KEY } from './constants';

export class BullMQQueue extends Queue {
  private queueEventsList: QueueEvents[] = [];
  private queueEventsProducerList: QueueEventsProducer[] = [];

  constructor(
    protected queueName: string,
    protected queueOptions: QueueOptions
  ) {
    super(queueName, queueOptions);
  }

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
    return this.queueName;
  }

  public createQueueEvents(options?: QueueEventsOptions) {
    const evt = new QueueEvents(this.name, {
      connection: this.queueOptions.connection,
      prefix: this.queueOptions.prefix,
      ...options,
    });
    this.queueEventsList.push(evt);
    return evt;
  }

  public getQueueEventsList() {
    return this.queueEventsList;
  }

  public createQueueEventsProducer(options?: QueueBaseOptions) {
    const producer = new QueueEventsProducer(this.name, {
      connection: this.queueOptions.connection,
      prefix: this.queueOptions.prefix,
      ...options,
    });
    this.queueEventsProducerList.push(producer);
    return producer;
  }

  public getQueueEventsProducerList() {
    return this.queueEventsProducerList;
  }
}

@Framework()
export class BullMQFramework extends BaseFramework<Application, Context, any> {
  private defaultConnection: {
    connection?: ConnectionOptions;
    prefix?: string;
  };
  private defaultQueueConfig: QueueOptions;
  private defaultWorkerConfig: WorkerOptions;
  private clearRepeatJobWhenStart: boolean;
  private queueMap: Map<string, BullMQQueue> = new Map();
  private workerMap: Map<string, Worker[]> = new Map();
  private flowProducerMap: Map<string, FlowProducer> = new Map();

  @Logger('bullMQLogger')
  protected bullMQLogger: ILogger;

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.app = {} as any;
  }

  public loadConfig() {
    const defaultConnection = this.configService.getConfiguration(
      'bullmq.defaultConnection'
    );

    const defaultPrefix = this.configService.getConfiguration(
      'bullmq.defaultPrefix'
    );

    this.defaultConnection = {
      connection: defaultConnection,
      prefix: defaultPrefix,
    };

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
        workerOptions?: WorkerOptions;
        queueOptions?: QueueOptions;
      };
      const { repeat, ...otherOptions } = options.jobOptions ?? {};
      const queueOptions = options.queueOptions ?? {};
      const currentQueue = this.ensureQueue(options.queueName, {
        ...queueOptions,
        defaultJobOptions: otherOptions,
      });
      if (!currentQueue) {
        throw new MidwayCommonError(`[midway:bullmq] Queue ${options.queueName} not found`);
      }
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
        // add repeatable job
        await this.getQueue(options.queueName)?.runJob({}, options.jobOptions);
      }
    }
  }

  protected async beforeStop() {
    // loop queueMap and stop all queue
    for (const queue of this.queueMap.values()) {
      await queue.close();
    }
    for (const worker of this.workerMap.values()) {
      for (const w of worker) {
        await w.close();
      }
    }
    for (const producer of this.flowProducerMap.values()) {
      await producer.close();
    }
  }

  /**
   * Create a queue with name and queueOptions
   */
  public createQueue(name: string, queueOptions: Partial<QueueOptions> = {}) {
    const mergedOptions = {
      ...this.defaultQueueConfig,
      ...this.defaultConnection,
      ...queueOptions,
    };
    const queue = new BullMQQueue(name, mergedOptions);
    this.queueMap.set(name, queue);
    queue.on('error', err => {
      this.bullMQLogger.error(err);
    });
    return queue;
  }

  /**
   * Get a queue by name
   */
  public getQueue(name: string) {
    return this.queueMap.get(name);
  }

  /**
   * Ensure a queue by name and queueOptions
   */
  protected ensureQueue(name: string, queueOptions: Partial<QueueOptions> = {}) {
    if (!this.queueMap.has(name)) {
      this.createQueue(name, queueOptions);
    }
    return this.queueMap.get(name);
  }

  public getQueueList() {
    return Array.from(this.queueMap.values());
  }

  /**
   * Get the first worker by queueName
   */
  public getWorker(queueName: string): Worker {
    return this.workerMap.get(queueName)?.[0];
  }

  /**
   * Get all workers by queueName
   */
  public getWorkers(queueName: string): Worker[] {
    return this.workerMap.get(queueName);
  }

  /**
   * Create a worker
   */
  public createWorker(
    queueName: string,
    processor: (job: Job, token?: string) => Promise<any>,
    workerOptions: Partial<WorkerOptions> = {}
  ): Worker {
    const merged = {
      ...this.defaultConnection,
      ...this.defaultWorkerConfig,
      ...workerOptions,
    };

    const worker = new Worker(queueName, processor, merged);

    if (!this.workerMap.has(queueName)) {
      this.workerMap.set(queueName, []);
    }
    this.workerMap.get(queueName).push(worker);
    return worker;
  }

  /**
   * Add a processor class and init a worker
   */
  public async addProcessor(
    processor: new (...args) => IProcessor,
    queueName: string,
    workerOptions?: WorkerOptions
  ) {
    const queue = this.queueMap.get(queueName);
    if (!queue) throw Error(`queue not found ${queueName}`);
    return this.createWorker(
      queueName,
      async (job: Job, token) => {
        const ctx = this.app.createAnonymousContext({
          jobId: job.id,
          job,
          token,
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
              job,
              token
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
      workerOptions
    );
  }

  /**
   * Create a flow producer, if producerName is provided, it will be store.
   */
  public createFlowProducer(
    options?: QueueBaseOptions,
    producerName?: string
  ): FlowProducer {
    const producer = new FlowProducer({
      ...this.defaultConnection,
      ...options,
    });

    if (producerName) {
      this.flowProducerMap.set(producerName, producer);
    }
    return producer;
  }

  /**
   * Get a flow producer by name
   */
  public getFlowProducer(producerName: string): FlowProducer | undefined {
    return this.flowProducerMap.get(producerName);
  }
}
