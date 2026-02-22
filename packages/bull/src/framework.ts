import {
  BaseFramework,
  extend,
  IMidwayBootstrapOptions,
  Framework,
  Utils,
  MidwayInvokeForbiddenError,
  DecoratorManager,
  MetadataManager,
  MidwayTraceService,
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

  public async addJobToQueue(data: any, options?: JobOptions): Promise<Job> {
    return this.add(data || {}, options) as unknown as Job;
  }

  /**
   * @deprecated use addJobToQueue instead
   */
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
  protected frameworkLoggerName = 'bullLogger';

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
    const processorModules = DecoratorManager.listModule(BULL_PROCESSOR_KEY);
    for (const mod of processorModules) {
      const options = MetadataManager.getOwnMetadata(
        BULL_PROCESSOR_KEY,
        mod
      ) as {
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
        await this.addJobToQueue(options.queueName, {}, options.jobOptions);
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
    queue.on('error', err => {
      this.logger.error(err);
    });
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

      try {
        const traceService = this.applicationContext.get(MidwayTraceService);
        const traceMetaResolver = (this.configurationOptions as any)?.tracing
          ?.meta;
        const traceEnabled =
          (this.configurationOptions as any)?.tracing?.enable !== false;
        const traceExtractor = (this.configurationOptions as any)?.tracing
          ?.extractor;
        const carrierDefault = job?.data?.__midwayTraceCarrier ?? {};
        const carrier =
          typeof traceExtractor === 'function'
            ? traceExtractor({
                ctx,
                carrier: carrierDefault,
                request: job,
                custom: {
                  queueName: queue.getQueueName(),
                },
              })
            : carrierDefault;
        return await traceService.runWithEntrySpan(
          `bull ${queue.getQueueName()}`,
          {
            enable: traceEnabled,
            carrier: carrier ?? carrierDefault,
            attributes: {
              'midway.protocol': 'bull',
              'midway.bull.queue': queue.getQueueName(),
            },
            meta: traceMetaResolver,
            metaArgs: {
              ctx,
              carrier: carrier ?? carrierDefault,
              request: job,
              custom: {
                queueName: queue.getQueueName(),
              },
            },
          },
          async () => {
            ctx.logger.info(
              `start process job ${job.id} from ${processor.name}`
            );

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
          }
        );
      } catch (err) {
        ctx.logger.error(err);
        return Promise.reject(err);
      }
    });
  }

  public async addJobToQueue(
    queueName: string,
    jobData: any,
    options?: JobOptions
  ): Promise<Job | undefined> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      const traceService = this.applicationContext.get(MidwayTraceService);
      const traceMetaResolver = (this.configurationOptions as any)?.tracing
        ?.meta;
      const traceEnabled =
        (this.configurationOptions as any)?.tracing?.enable !== false;
      const traceInjector = (this.configurationOptions as any)?.tracing
        ?.injector;
      const payload = {
        ...(jobData ?? {}),
      };
      const rawCarrier =
        typeof traceInjector === 'function'
          ? traceInjector({
              request: jobData,
              custom: {
                queueName,
              },
            })
          : {};
      const exitCarrier =
        rawCarrier && typeof rawCarrier === 'object' ? rawCarrier : {};
      payload.__midwayTraceCarrier = exitCarrier;
      await traceService.runWithExitSpan(
        `bull.produce ${queueName}`,
        {
          enable: traceEnabled,
          carrier: exitCarrier,
          attributes: {
            'midway.protocol': 'bull',
            'midway.bull.queue': queueName,
          },
          meta: traceMetaResolver,
          metaArgs: {
            carrier: exitCarrier,
            request: jobData,
            custom: {
              queueName,
            },
          },
        },
        async () => undefined
      );
      return await queue.addJobToQueue(payload, options);
    }
  }

  /**
   * @deprecated use addJob instead
   */
  public async runJob(
    queueName: string,
    jobData: any,
    options?: JobOptions
  ): Promise<Job | undefined> {
    return this.addJobToQueue(queueName, jobData, options);
  }

  public async getJob(queueName: string, jobName: string): Promise<Job> {
    const queue = this.queueMap.get(queueName);
    if (queue) {
      return queue.getJob(jobName);
    }
  }
}
